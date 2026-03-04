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
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as Periodo)}
        className="w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer"
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
