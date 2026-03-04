'use client'

import type { Periodo } from '@/lib/types'

const PERIODS: { value: Periodo; label: string }[] = [
  { value: 'semana', label: 'Esta semana' },
  { value: 'quinzena', label: '15 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: 'total', label: 'Total' },
]

interface PeriodFilterProps {
  selected: Periodo
  onChange: (p: Periodo) => void
}

export function PeriodFilter({ selected, onChange }: PeriodFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === p.value
              ? 'bg-julius-accent text-white'
              : 'bg-julius-card text-julius-muted'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
