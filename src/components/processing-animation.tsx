'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { ConfirmPaymentResponse } from '@/lib/api/types'

interface ProcessingAnimationProps {
  isLoading: boolean
  result: ConfirmPaymentResponse | null
  error: string | null
  orderId: string
  storeUrl: string
  onRetry: () => void
}

export function ProcessingAnimation({
  isLoading,
  result,
  error,
  orderId,
  storeUrl,
  onRetry
}: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [countdown, setCountdown] = useState(4)

  const steps = [
    { title: 'Securing Channel', desc: 'Establishing 256-bit TLS handshake' },
    { title: 'Card Processing', desc: 'Authorizing with issuer network' },
    { title: 'Saga Choreography', desc: 'Emitting RabbitMQ payment events' }
  ]

  useEffect(() => {
    if (isLoading) {
      setCurrentStep(0)
      const t1 = setTimeout(() => setCurrentStep(1), 600)
      const t2 = setTimeout(() => setCurrentStep(2), 1400)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [isLoading])

  // Countdown auto-redirect on success
  useEffect(() => {
    if (result && result.status === 'SUCCEEDED') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            window.location.href = `${storeUrl}/orders/${orderId}`
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [result, orderId, storeUrl])

  if (!isLoading && !result && !error) return null

  const isSuccess = result?.status === 'SUCCEEDED'
  const isFailed = result?.status === 'FAILED' || !!error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 text-center shadow-2xl space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 py-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse" />
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Processing Transaction
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Communicating with banking network & Saga event bus...
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-3 text-left">
              {steps.map((step, idx) => {
                const isActive = currentStep === idx
                const isDone = currentStep > idx
                return (
                  <div
                    key={step.title}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-xs ${
                      isActive
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                        : isDone
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                        : 'border-slate-800/60 text-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-[10px] text-slate-400">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Success State */}
        {!isLoading && isSuccess && (
          <div className="space-y-5 py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Payment Authorized!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Transaction ID: <span className="font-mono text-emerald-400">{result.paymentId}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Amount Paid:</span>
                <span className="font-bold text-white font-sans">{Math.round(result.amount).toLocaleString('uk-UA')} грн</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Saga Status:</span>
                <span className="font-semibold text-emerald-400">order.confirmed published</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Redirecting to live order tracking in <span className="font-bold text-white font-mono">{countdown}s</span>...
            </p>

            <button
              type="button"
              onClick={() => (window.location.href = `${storeUrl}/orders/${orderId}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-600/30"
            >
              <span>Track Live Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Failed State */}
        {!isLoading && isFailed && (
          <div className="space-y-5 py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <XCircle className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Payment Declined
              </h3>
              <p className="text-xs text-rose-300 mt-1">
                {result?.failureReason || error || 'Transaction could not be completed.'}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-left text-xs space-y-1.5">
              <p className="text-slate-300 font-semibold">Saga Event Orchestration:</p>
              <p className="text-slate-400 font-mono text-[11px]">
                ➔ Emitted <span className="text-rose-400 font-bold">payment.failed</span> to RabbitMQ
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                ➔ Inventory Service released reserved items
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                ➔ Order status set to <span className="text-rose-400 font-bold">CANCELLED</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white transition-all border border-slate-700"
              >
                Change Card / Retry
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = `${storeUrl}/orders/${orderId}`)}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-rose-600/20"
              >
                View Order Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
