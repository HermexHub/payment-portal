'use client'

import React from 'react'
import { CheckCircle, AlertOctagon, Clock, CreditCard, Ban } from 'lucide-react'
import { PaymentScenario } from '@/lib/api/types'

interface SagaScenarioSelectorProps {
  currentScenario: PaymentScenario
  onSelect: (scenario: PaymentScenario, cardNumber: string, expiry: string, cvv: string) => void
}

interface ScenarioOption {
  key: PaymentScenario
  label: string
  icon: React.ReactNode
  badgeColor: string
  cardNumber: string
  expiry: string
  cvv: string
  description: string
}

export function SagaScenarioSelector({
  currentScenario,
  onSelect
}: SagaScenarioSelectorProps) {
  const scenarios: ScenarioOption[] = [
    {
      key: 'SUCCESS',
      label: 'Success (Happy Path)',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvv: '123',
      description: 'Funds charged successfully; Saga confirms order status to CONFIRMED'
    },
    {
      key: 'INSUFFICIENT_FUNDS',
      label: 'No Funds (Rollback)',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />,
      badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
      cardNumber: '4242 4242 4242 0116',
      expiry: '12/28',
      cvv: '123',
      description: 'Payment fails; triggers Inventory compensation & order cancellation'
    },
    {
      key: 'CARD_EXPIRED',
      label: 'Expired Card',
      icon: <CreditCard className="w-3.5 h-3.5 text-amber-400" />,
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
      cardNumber: '4242 4242 4242 0069',
      expiry: '12/28',
      cvv: '123',
      description: 'Card rejected as expired; triggers full compensating rollback'
    },
    {
      key: 'BANK_DECLINE',
      label: 'Bank Decline',
      icon: <Ban className="w-3.5 h-3.5 text-purple-400" />,
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20',
      cardNumber: '4242 4242 4242 0002',
      expiry: '12/28',
      cvv: '123',
      description: 'Issuer refuses transaction; unlocks reserved inventory'
    },
    {
      key: 'TIMEOUT',
      label: 'Timeout / DLQ',
      icon: <Clock className="w-3.5 h-3.5 text-blue-400" />,
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20',
      cardNumber: '4242 4242 4242 9999',
      expiry: '12/28',
      cvv: '123',
      description: 'Simulates network latency and Dead Letter Queue failover'
    }
  ]

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-900/50 bg-indigo-950/20 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🧪</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Saga Interactive Simulator (Test Lab)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          Auto-fill 1-Click
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Choose a scenario to simulate RabbitMQ event choreography and compensation rollbacks:
      </p>

      {/* Scenario Chips */}
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => {
          const isActive = currentScenario === sc.key
          return (
            <button
              key={sc.key}
              type="button"
              onClick={() => onSelect(sc.key, sc.cardNumber, sc.expiry, sc.cvv)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                isActive
                  ? 'border-white/50 bg-white/15 text-white shadow-md ring-1 ring-white/30'
                  : sc.badgeColor
              }`}
            >
              {sc.icon}
              <span>{sc.label}</span>
            </button>
          )
        })}
      </div>

      {/* Active Scenario Explainer */}
      <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
        <span className="text-indigo-400 font-semibold">Simulation Target: </span>
        {scenarios.find((s) => s.key === currentScenario)?.description}
      </div>
    </div>
  )
}
