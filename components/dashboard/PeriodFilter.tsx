'use client'

import type { Periodo } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'

interface PeriodFilterProps {
  selected: Periodo
  onChange: (p: Periodo) => void
  dimmed?: boolean
}

export function PeriodFilter({ selected, onChange, dimmed }: PeriodFilterProps) {
  const t = useTranslation()
  const PERIODS: { value: Periodo; label: string }[] = [
    { value: 'mes', label: t.periods.mes },
    { value: 'semana', label: t.periods.semana },
    { value: 'hoje', label: t.periods.hoje },
    { value: 'trimestre', label: t.periods.trimestre },
    { value: 'total', label: t.periods.total },
  ]
  return (
    <div className="relative">
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value as Periodo)}
        className={`w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer transition-opacity ${dimmed ? 'opacity-40' : ''}`}
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
