'use client'

import React from 'react'
import { Wifi } from 'lucide-react'

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
    <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl p-6 text-white shadow-xl overflow-hidden select-none transition-all duration-300 hover:shadow-2xl border border-slate-700/60 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800">
      {/* Subtle Card Sheen */}
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Row: Chip & Contactless */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Realistic EMV Smart Chip */}
          <div className="relative w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 p-0.5 border border-amber-600/40 shadow-inner overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[2px] p-[2px] opacity-70">
              <div className="border-r border-b border-amber-900/40 rounded-tl-[2px]" />
              <div className="border-b border-amber-900/40" />
              <div className="border-l border-b border-amber-900/40 rounded-tr-[2px]" />
              <div className="border-r border-amber-900/40 rounded-bl-[2px]" />
              <div className="" />
              <div className="border-l border-amber-900/40 rounded-br-[2px]" />
            </div>
            <div className="w-full h-full rounded-[3px] border border-amber-800/20" />
          </div>

          {/* Contactless Wave */}
          <Wifi className="w-4 h-4 text-slate-400 rotate-90" />
        </div>

        {/* Card Brand Logo */}
        <div className="text-right">
          {isMastercard ? (
            <div className="flex -space-x-2 items-center">
              <div className="w-6 h-6 rounded-full bg-rose-500 opacity-90 shadow-xs" />
              <div className="w-6 h-6 rounded-full bg-amber-400 opacity-90 shadow-xs" />
            </div>
          ) : isVisa ? (
            <span className="font-extrabold italic text-xl tracking-wider text-white drop-shadow-sm">
              VISA
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Hermex Card
            </span>
          )}
        </div>
      </div>

      {/* Card Number - Compact spacing between 4-digit blocks */}
      <div className="relative z-10 my-4">
        <div className="flex items-center gap-3 font-mono text-lg sm:text-xl tracking-normal text-slate-100 font-medium drop-shadow-sm">
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
            Cardholder
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
