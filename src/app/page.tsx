'use client'

import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function PaymentPortalHome() {
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'

  useEffect(() => {
    window.location.href = storeUrl
  }, [storeUrl])

  return (
    <div className="max-w-md mx-auto my-24 p-8 rounded-3xl border border-slate-200 bg-white text-center space-y-4 shadow-xs">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
      <h2 className="text-base font-bold text-slate-900">Перенаправлення до магазину...</h2>
      <p className="text-xs text-slate-500">
        Оплата доступна лише за прямим посиланням вашого замовлення.
      </p>
      <a
        href={storeUrl}
        className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
      >
        Перейти до витрини Hermex
      </a>
    </div>
  )
}
