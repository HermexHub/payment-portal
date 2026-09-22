'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Clock,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Loader2
} from 'lucide-react'
import { fetchOrderDetails, confirmPaymentApi, fetchPaymentSession } from '@/lib/api/client'
import {
  ConfirmPaymentResponse,
  OrderDetails,
  PaymentScenario,
  PaymentSession
} from '@/lib/api/types'
import { PaymentCardVisualizer } from '@/components/payment-card-visualizer'
import { ProcessingAnimation } from '@/components/processing-animation'
import { SagaScenarioSelector } from '@/components/saga-scenario-selector'

function formatItemTitle(item: { productName?: string; productId: string }): string {
  if (item.productName && item.productName.trim()) {
    return item.productName
  }
  if (!item.productId) return 'Товар'
  return item.productId
    .split('-')
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

export default function HostedPayPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = params?.id as string
  const token = searchParams?.get('token')

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'

  const RESERVATION_SECONDS = 15 * 60

  const getRemainingSeconds = (targetTimeMs: number): number => {
    const diff = Math.floor((targetTimeMs - Date.now()) / 1000)
    return Math.min(RESERVATION_SECONDS, Math.max(0, diff))
  }

  // Token cache to survive reload without query string
  const [effectiveToken, setEffectiveToken] = useState<string | null>(token || null)

  useEffect(() => {
    if (token) {
      setEffectiveToken(token)
      if (typeof window !== 'undefined' && orderId) {
        try {
          localStorage.setItem(`hermex_portal_token_${orderId}`, token)
        } catch {}
      }
    } else if (typeof window !== 'undefined' && orderId) {
      try {
        const savedToken = localStorage.getItem(`hermex_portal_token_${orderId}`)
        if (savedToken) setEffectiveToken(savedToken)
      } catch {}
    }
  }, [token, orderId])

  // Order details cached in localStorage so reload never causes product items to disappear
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(() => {
    if (typeof window !== 'undefined' && orderId) {
      try {
        const cached = localStorage.getItem(`hermex_order_details_${orderId}`)
        if (cached) return JSON.parse(cached)
      } catch {}
    }
    return null
  })
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  // Form inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardHolder, setCardHolder] = useState('ALEX MERCER')
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('123')
  const [scenario, setScenario] = useState<PaymentScenario>('SUCCESS')

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processResult, setProcessResult] = useState<ConfirmPaymentResponse | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Expiration countdown: initialized from localStorage target timestamp, never resets to 15:00 on reload
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (typeof window !== 'undefined' && orderId) {
      try {
        const savedExp = localStorage.getItem(`hermex_order_timer_${orderId}`)
        if (savedExp) {
          const parsed = Number(savedExp)
          if (!isNaN(parsed)) {
            return getRemainingSeconds(parsed)
          }
        } else {
          const provisional = Date.now() + RESERVATION_SECONDS * 1000
          localStorage.setItem(`hermex_order_timer_${orderId}`, provisional.toString())
          return RESERVATION_SECONDS
        }
      } catch {}
    }
    return RESERVATION_SECONDS
  })

  // Synchronize authoritative target expiration time when order or paymentSession createdAt arrives
  useEffect(() => {
    const createdAt = paymentSession?.createdAt || orderDetails?.createdAt
    if (createdAt && typeof window !== 'undefined' && orderId) {
      const createdMs = new Date(createdAt).getTime()
      if (!isNaN(createdMs)) {
        const authoritativeExpiresAt = createdMs + RESERVATION_SECONDS * 1000
        try {
          localStorage.setItem(`hermex_order_timer_${orderId}`, authoritativeExpiresAt.toString())
        } catch {}
        setTimeLeft(getRemainingSeconds(authoritativeExpiresAt))
      }
    }
  }, [paymentSession?.createdAt, orderDetails?.createdAt, orderId])

  // Wall-clock synchronized countdown interval
  useEffect(() => {
    if (!orderId) return

    const tick = () => {
      if (typeof window !== 'undefined') {
        try {
          const savedExp = localStorage.getItem(`hermex_order_timer_${orderId}`)
          if (savedExp) {
            const parsed = Number(savedExp)
            if (!isNaN(parsed)) {
              setTimeLeft(getRemainingSeconds(parsed))
              return
            }
          }
        } catch {}
      }
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [orderId])

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Load order data
  useEffect(() => {
    if (!orderId) return

    async function loadData() {
      // If cached data is present, do not show full-page blocking spinner on reload
      if (!orderDetails && !paymentSession) {
        setLoading(true)
      }
      setPageError(null)
      try {
        const activeToken =
          token ||
          effectiveToken ||
          (typeof window !== 'undefined' ? localStorage.getItem(`hermex_portal_token_${orderId}`) : null)

        const [orderRes, sessionRes] = await Promise.allSettled([
          fetchOrderDetails(orderId, activeToken),
          fetchPaymentSession(orderId)
        ])

        if (orderRes.status === 'fulfilled' && orderRes.value) {
          setOrderDetails(orderRes.value)
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`hermex_order_details_${orderId}`, JSON.stringify(orderRes.value))
            } catch {}
          }
        }
        if (sessionRes.status === 'fulfilled' && sessionRes.value) {
          setPaymentSession(sessionRes.value)
        }

        if (
          orderRes.status === 'rejected' &&
          sessionRes.status === 'rejected' &&
          !orderDetails &&
          !paymentSession
        ) {
          throw new Error('Не вдалося знайти замовлення або платіжну сесію')
        }
      } catch (err) {
        setPageError((err as Error).message || 'Помилка завантаження даних оплати')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [orderId, token, effectiveToken])

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    setCardNumber(formatted)
  }

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2, 4)}`)
    } else {
      setExpiry(digits)
    }
  }

  // Quick auto-fill from scenario selector
  const handleScenarioSelect = (
    newScenario: PaymentScenario,
    card: string,
    exp: string,
    code: string
  ) => {
    setScenario(newScenario)
    setCardNumber(card)
    setExpiry(exp)
    setCvv(code)
  }

  // Submit payment
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    setProcessResult(null)

    try {
      const response = await confirmPaymentApi(orderId, {
        cardNumber: cardNumber.replace(/\s+/g, ''),
        cardHolder: cardHolder.trim().toUpperCase(),
        expiry,
        cvv,
        scenario
      })
      setProcessResult(response)
    } catch (err) {
      setSubmitError((err as Error).message || 'Помилка під час обробки платежу')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculatedItemsTotal =
    orderDetails?.items?.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    ) || 0

  const totalAmount =
    (paymentSession?.amount && Number(paymentSession.amount) > 0 ? Number(paymentSession.amount) : null) ??
    (orderDetails?.totalAmount && Number(orderDetails.totalAmount) > 0 ? Number(orderDetails.totalAmount) : null) ??
    (calculatedItemsTotal > 0 ? calculatedItemsTotal : 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-medium text-slate-500">Завантаження захищеної платіжної сесії...</p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-rose-200 bg-rose-50 text-center space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Платіжна сесія недійсна</h2>
        <p className="text-xs text-rose-600">{pageError}</p>
        <button
          onClick={() => (window.location.href = `${storeUrl}`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Повернутися до магазину</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Banner: Return & Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => (window.location.href = `${storeUrl}/checkout`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Скасувати та повернутися до кошика</span>
        </button>

        {/* Order Reservation Expiry Timer */}
        <div
          className={`flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-full border shadow-2xs transition-colors ${
            timeLeft === 0
              ? 'border-rose-300 text-rose-600 bg-rose-50/50'
              : timeLeft <= 120
              ? 'border-amber-300 text-amber-700 bg-amber-50/50'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          <Clock
            className={`w-3.5 h-3.5 ${
              timeLeft === 0
                ? 'text-rose-500'
                : timeLeft <= 120
                ? 'text-amber-600 animate-pulse'
                : 'text-amber-500'
            }`}
          />
          <span>{timeLeft === 0 ? 'Час резерву вичерпано:' : 'Резерв замовлення:'} </span>
          <span
            className={`font-mono font-bold ${
              timeLeft === 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Grid: Order Summary vs Card Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Summary & Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Details Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  Номер замовлення
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 truncate max-w-[200px]">
                  {orderId}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                {paymentSession?.status || orderDetails?.status || 'PENDING'}
              </span>
            </div>

            {/* Items summary */}
            {orderDetails?.items && orderDetails.items.length > 0 ? (
              <div className="space-y-2 py-2 max-h-48 overflow-y-auto divide-y divide-slate-50">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Товари у замовленні:
                </span>
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-700 pt-1.5">
                    <span className="truncate max-w-[200px]" title={item.productName || item.productId}>
                      {formatItemTitle(item)} × {item.quantity}
                    </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {Math.round(item.price * item.quantity).toLocaleString('uk-UA')} грн
                    </span>
                  </div>
                ))}
              </div>
            ) : paymentSession ? (
              <div className="space-y-2 py-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Товари у замовленні:
                </span>
                <div className="flex justify-between items-center text-xs text-slate-700 pt-1.5">
                  <span className="text-slate-500 truncate max-w-[200px]">
                    Замовлення #{orderId.slice(0, 8)}...
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {Math.round(Number(paymentSession.amount)).toLocaleString('uk-UA')} грн
                  </span>
                </div>
              </div>
            ) : null}

            {/* Total Amount Due */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">До сплати:</span>
                <p className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                  {Math.round(totalAmount).toLocaleString('uk-UA')} <span className="text-xs text-slate-500 font-normal">грн</span>
                </p>
              </div>
            </div>
          </div>

          {/* Saga Test Controls (Collapsible Developer Drawer) */}
          <SagaScenarioSelector
            currentScenario={scenario}
            onSelect={handleScenarioSelect}
          />
        </div>

        {/* Right Column: Card Visualizer & Payment Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card Preview Visualizer */}
          <div className="flex justify-center">
            <PaymentCardVisualizer
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiry={expiry}
            />
          </div>

          {/* Payment Form */}
          <form
            onSubmit={handlePay}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Дані банківської картки</span>
              </h3>
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Номер картки
              </label>
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 tracking-wider shadow-2xs transition-all"
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ім'я та прізвище власника (латиницею)
              </label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="ALEX MERCER"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 tracking-wider shadow-2xs transition-all"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Термін дії (ММ/РР)
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 tracking-wider shadow-2xs transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Код безпеки (CVV)
                </label>
                <input
                  type="password"
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 tracking-wider shadow-2xs transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || timeLeft <= 0}
              className="w-full mt-2 inline-flex items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 py-4 text-sm font-bold text-white transition-all shadow-md shadow-blue-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Оплатити {Math.round(totalAmount).toLocaleString('uk-UA')} грн</span>
            </button>
          </form>
        </div>
      </div>

      {/* Processing / Disposition Animation Modal */}
      <ProcessingAnimation
        isLoading={isSubmitting}
        result={processResult}
        error={submitError}
        orderId={orderId}
        storeUrl={storeUrl}
        onRetry={() => {
          setProcessResult(null)
          setSubmitError(null)
        }}
      />
    </div>
  )
}
