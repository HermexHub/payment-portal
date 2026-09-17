'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CreditCard, ShieldCheck, ShoppingBag } from 'lucide-react'

export default function PaymentPortalHome() {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'

  const handleGoToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (orderId.trim()) {
      router.push(`/pay/${orderId.trim()}`)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 space-y-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
        <CreditCard className="w-8 h-8" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Hermex Hosted Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Secure, isolated PCI-DSS compliant checkout session. Enter your Order ID to proceed or start shopping in the main store.
        </p>
      </div>

      <form
        onSubmit={handleGoToPayment}
        className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4 text-left"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Order UUID
          </label>
          <input
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/90 px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/20"
        >
          <span>Open Checkout Session</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-2">
        <a
          href={storeUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Return to Hermex Storefront</span>
        </a>
      </div>
    </div>
  )
}
