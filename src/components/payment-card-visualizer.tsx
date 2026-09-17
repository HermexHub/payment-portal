'use client'

import React from 'react'
import { Cpu, Wifi } from 'lucide-react'

interface PaymentCardVisualizerProps {
  cardNumber: string
  cardHolder: string
  expiry: string
  isFlipped?: boolean
}

export function PaymentCardVisualizer({
  cardNumber,
  cardHolder,
  expiry
}: PaymentCardVisualizerProps) {
  // Format 16 digits into 4 chunks
  const cleanNumber = cardNumber.replace(/\D/g, '')
  const chunks = [
    cleanNumber.slice(0, 4).padEnd(4, '•'),
    cleanNumber.slice(4, 8).padEnd(4, '•'),
    cleanNumber.slice(8, 12).padEnd(4, '•'),
    cleanNumber.slice(12, 16).padEnd(4, '•')
  ]

  const isMastercard = cleanNumber.startsWith('5')
  const isVisa = cleanNumber.startsWith('4')

  return (
    <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-6 text-white shadow-2xl overflow-hidden select-none transition-all duration-300 transform hover:scale-[1.02] border border-white/10 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
      {/* Decorative Glow Orbs */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Row: Chip & Contactless */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Chip */}
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
            <Cpu className="w-6 h-6 text-amber-950/80" />
          </div>
          {/* Contactless */}
          <Wifi className="w-5 h-5 text-slate-400 rotate-90" />
        </div>

        {/* Card Brand */}
        <div className="text-right">
          {isMastercard ? (
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-rose-500 opacity-90" />
              <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90" />
            </div>
          ) : isVisa ? (
            <span className="font-extrabold italic text-xl tracking-wider text-blue-400 drop-shadow">
              VISA
            </span>
          ) : (
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              HERMEX SECURE
            </span>
          )}
        </div>
      </div>

      {/* Card Number */}
      <div className="relative z-10 my-4">
        <div className="flex items-center justify-between font-mono text-lg sm:text-xl tracking-widest text-slate-200 drop-shadow">
          <span>{chunks[0]}</span>
          <span>{chunks[1]}</span>
          <span>{chunks[2]}</span>
          <span>{chunks[3]}</span>
        </div>
      </div>

      {/* Bottom Row: Holder & Expiry */}
      <div className="relative z-10 flex items-end justify-between text-xs mt-4">
        <div>
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">
            Cardholder Name
          </span>
          <span className="font-semibold tracking-wider text-white truncate max-w-[170px] block uppercase font-mono">
            {cardHolder || 'FULL NAME'}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium mb-0.5">
            Expires
          </span>
          <span className="font-semibold tracking-wider text-white font-mono">
            {expiry || 'MM/YY'}
          </span>
        </div>
      </div>
    </div>
  )
}
