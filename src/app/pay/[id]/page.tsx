'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Lock,
  Clock,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  ShoppingBag,
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

export default function HostedPayPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params?.id as string

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'

  // State
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
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

  // Expiration countdown (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Load order data
  useEffect(() => {
    if (!orderId) return

    async function loadData() {
      setLoading(true)
      setPageError(null)
      try {
        // Try fetching order details and payment session in parallel
        const [orderRes, sessionRes] = await Promise.allSettled([
          fetchOrderDetails(orderId),
          fetchPaymentSession(orderId)
        ])

        if (orderRes.status === 'fulfilled') {
          setOrderDetails(orderRes.value)
        }
        if (sessionRes.status === 'fulfilled') {
          setPaymentSession(sessionRes.value)
        }

        if (orderRes.status === 'rejected' && sessionRes.status === 'rejected') {
          throw new Error('Could not find order or payment session')
        }
      } catch (err) {
        setPageError((err as Error).message || 'Failed to load checkout details')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [orderId])

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
      setSubmitError((err as Error).message || 'Transaction processing failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount =
    paymentSession?.amount ??
    orderDetails?.totalAmount ??
    0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-xs text-slate-400">Loading secure checkout session...</p>
      </div>
    )
  }

  if (pageError) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Payment Session Invalid</h2>
        <p className="text-xs text-rose-300">{pageError}</p>
        <button
          onClick={() => (window.location.href = `${storeUrl}`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Store</span>
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel and Return to Store</span>
        </button>

        {/* Order Reservation Expiry Timer */}
        <div className="flex items-center gap-2 text-xs bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-800 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Inventory reserved for: </span>
          <span className="font-mono font-bold text-amber-300">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Grid: Order Summary vs Card Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Summary & Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Order Details Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  Order Reference
                </span>
                <p className="font-mono text-xs font-bold text-white truncate max-w-[200px]">
                  {orderId}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {paymentSession?.status || orderDetails?.status || 'PENDING'}
              </span>
            </div>

            {/* Items summary */}
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="space-y-2 py-2 max-h-48 overflow-y-auto">
                <span className="text-[11px] font-medium text-slate-400">Order Items:</span>
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                    <span className="truncate max-w-[180px]">
                      {item.productName || item.productId} × {item.quantity}
                    </span>
                    <span className="font-mono font-semibold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Total Amount Due */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Amount Due</span>
                <p className="text-2xl font-bold text-white font-mono tracking-tight">
                  ${totalAmount.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USD</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Guaranteed Rate
                </span>
              </div>
            </div>
          </div>

          {/* Saga Test Controls */}
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

          {/* Form */}
          <form
            onSubmit={handlePay}
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md space-y-5"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Card Information</span>
              </h3>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Encrypted Entry</span>
              </div>
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Card Number
              </label>
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Cardholder Full Name (Latin)
              </label>
              <input
                type="text"
                required
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                placeholder="ALEX MERCER"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm font-mono uppercase text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expiration Date
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Security Code (CVV)
                </label>
                <input
                  type="password"
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 tracking-wider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || timeLeft <= 0}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-4 text-sm font-bold text-white transition-all shadow-xl shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize & Pay ${totalAmount.toFixed(2)} USD</span>
            </button>

            <p className="text-[11px] text-center text-slate-500">
              By confirming, you trigger the distributed Saga choreography. Your card details are sanitized per PCI-DSS standards.
            </p>
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
