'use client'

import React, { useState } from 'react'
import { CheckCircle, AlertOctagon, Clock, CreditCard, Ban, ChevronDown } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(false)

  const scenarios: ScenarioOption[] = [
    {
      key: 'SUCCESS',
      label: 'Успіх (Happy Path)',
      icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
      badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/28',
      cvv: '123',
      description: 'Кошти списано успішно. Saga підтверджує замовлення зі статусом CONFIRMED.'
    },
    {
      key: 'INSUFFICIENT_FUNDS',
      label: 'Немає коштів (Rollback)',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />,
      badgeColor: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
      cardNumber: '4242 4242 4242 0116',
      expiry: '12/28',
      cvv: '123',
      description: 'Списання відхилено. Запускається компенсація складу та скасування замовлення.'
    },
    {
      key: 'CARD_EXPIRED',
      label: 'Картка прострочена',
      icon: <CreditCard className="w-3.5 h-3.5 text-amber-600" />,
      badgeColor: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
      cardNumber: '4242 4242 4242 0069',
      expiry: '12/28',
      cvv: '123',
      description: 'Картка відхилена як прострочена. Повний відкат Saga-транзакції.'
    },
    {
      key: 'BANK_DECLINE',
      label: 'Відмова банку',
      icon: <Ban className="w-3.5 h-3.5 text-purple-600" />,
      badgeColor: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
      cardNumber: '4242 4242 4242 0002',
      expiry: '12/28',
      cvv: '123',
      description: 'Банк-емітент відхилив операцію. Розблокування зарезервованого товару.'
    },
    {
      key: 'TIMEOUT',
      label: 'Таймаут / DLQ',
      icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
      badgeColor: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      cardNumber: '4242 4242 4242 9999',
      expiry: '12/28',
      cvv: '123',
      description: 'Симуляція мережевого таймауту та обробки через Dead Letter Queue.'
    }
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🧪</span>
          <span className="font-bold text-slate-800">Тестова лабораторія Saga (Developer Mode)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            {currentScenario}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            Оберіть тестовий сценарій для симуляції поведінки хореографії подій RabbitMQ:
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
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
          <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-blue-700 font-semibold">Опис сценарію: </span>
            {scenarios.find((s) => s.key === currentScenario)?.description}
          </div>
        </div>
      )}
    </div>
  )
}
