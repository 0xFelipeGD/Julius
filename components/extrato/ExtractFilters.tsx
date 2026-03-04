'use client'

import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import type { Periodo, Tag } from '@/lib/types'

const ALL_TAGS: { value: Tag | 'all'; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'Alimentacao', label: 'Alimentação' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Saude', label: 'Saúde' },
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Habitacao', label: 'Habitação' },
  { value: 'Outros', label: 'Outros' },
]

interface ExtractFiltersProps {
  periodo: Periodo
  tag: Tag | 'all'
  onPeriodoChange: (p: Periodo) => void
  onTagChange: (t: Tag | 'all') => void
}

export function ExtractFilters({ periodo, tag, onPeriodoChange, onTagChange }: ExtractFiltersProps) {
  return (
    <div>
      <PeriodFilter selected={periodo} onChange={onPeriodoChange} />
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none">
        {ALL_TAGS.map((t) => (
          <button
            key={t.value}
            onClick={() => onTagChange(t.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              tag === t.value
                ? 'bg-julius-accent text-white'
                : 'bg-julius-card text-julius-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
