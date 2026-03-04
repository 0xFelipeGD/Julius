'use client'

import { CATEGORIES } from '@/lib/categories'
import type { Periodo, Tag } from '@/lib/types'

const PERIODS: { value: Periodo; label: string }[] = [
  { value: 'semana', label: 'Esta semana' },
  { value: 'quinzena', label: '15 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: 'total', label: 'Total' },
]

interface ExtractFiltersProps {
  periodo: Periodo
  tag: Tag | 'all'
  onPeriodoChange: (p: Periodo) => void
  onTagChange: (t: Tag | 'all') => void
}

export function ExtractFilters({ periodo, tag, onPeriodoChange, onTagChange }: ExtractFiltersProps) {
  return (
    <div className="flex flex-1 gap-3 px-4 py-3">
      <div className="relative flex-1">
        <select
          value={periodo}
          onChange={(e) => onPeriodoChange(e.target.value as Periodo)}
          className="w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer"
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

      <div className="relative flex-1">
        <select
          value={tag}
          onChange={(e) => onTagChange(e.target.value as Tag | 'all')}
          className="w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer"
        >
          <option value="all">Tudo</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
