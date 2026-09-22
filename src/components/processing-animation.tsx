'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
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
    { title: 'З\'єднання з банком', desc: 'Надсилання платіжного запиту' },
    { title: 'Авторизація', desc: 'Перевірка банком-емітентом' },
    { title: 'Підтвердження', desc: 'Оновлення статусу замовлення' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-2xl space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6 py-4">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Обробка платежу
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Зв'язок із банківською мережею та платіжним шлюзом...
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2.5 text-left">
              {steps.map((step, idx) => {
                const isActive = currentStep === idx
                const isDone = currentStep > idx
                return (
                  <div
                    key={step.title}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-xs ${
                      isActive
                        ? 'border-blue-300 bg-blue-50/70 text-blue-900 font-medium'
                        : isDone
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 text-slate-400 bg-slate-50/50'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">{step.title}</p>
                      <p className="text-[10px] text-slate-500">{step.desc}</p>
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
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Оплату успішно підтверджено!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                ID транзакції: <span className="font-mono text-slate-700 font-semibold">{result.paymentId}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Сплачена сума:</span>
                <span className="font-bold text-slate-900 font-sans">{Math.round(result.amount).toLocaleString('uk-UA')} грн</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Статус замовлення:</span>
                <span className="font-semibold text-emerald-700">Підтверджено (CONFIRMED)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Перехід до відстеження замовлення через <span className="font-bold text-slate-900 font-mono">{countdown} с</span>...
            </p>

            <button
              type="button"
              onClick={() => (window.location.href = `${storeUrl}/orders/${orderId}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <span>Перейти до замовлення зараз</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Failed State */}
        {!isLoading && isFailed && (
          <div className="space-y-5 py-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <XCircle className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Оплату відхилено
              </h3>
              <p className="text-xs text-rose-600 mt-1">
                {result?.failureReason || error || 'Не вдалося завершити транзакцію.'}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-left text-xs space-y-1.5 text-slate-600">
              <p className="font-semibold text-slate-800">Результат операції:</p>
              <p className="text-[11px]">
                ➔ Банк-емітент відхилив списання коштів
              </p>
              <p className="text-[11px]">
                ➔ Резерв товарів автоматично повернуто на склад
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 rounded-2xl bg-slate-100 hover:bg-slate-200 px-4 py-3 text-xs font-bold text-slate-800 transition-all border border-slate-200 cursor-pointer"
              >
                Змінити картку
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = `${storeUrl}/orders/${orderId}`)}
                className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700 px-4 py-3 text-xs font-bold text-white transition-all shadow-sm shadow-rose-600/20 cursor-pointer"
              >
                До деталей замовлення
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
