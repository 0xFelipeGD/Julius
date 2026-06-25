'use client'

import type { Periodo } from '@/lib/types'

interface PeriodFilterProps {
  selected: Periodo
  onChange: (p: Periodo) => void
  dimmed?: boolean
}

export function PeriodFilter({ selected, onChange, dimmed }: PeriodFilterProps) {
  const PERIODS: { value: Periodo; label: string }[] = [
    { value: 'mes', label: 'Month' },
    { value: 'semana', label: 'Week' },
    { value: 'hoje', label: 'Today' },
    { value: 'trimestre', label: 'Quarter' },
    { value: 'total', label: 'Year' },
  ]
  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as Periodo)}
        className={`h-11 w-full cursor-pointer appearance-none rounded-xl border border-julius-border bg-julius-card px-3 py-2.5 pr-8 text-xs font-medium text-julius-text transition-opacity focus:border-julius-accent focus:outline-none ${dimmed ? 'opacity-40' : ''}`}
      >
        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
        <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
