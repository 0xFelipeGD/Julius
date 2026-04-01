'use client'

import { CATEGORIES, getCategoryLabel } from '@/lib/categories'
import { useTranslation } from '@/lib/i18n'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getRegionConfig } from '@/lib/config/regions'
import type { Periodo, Tag } from '@/lib/types'

interface ExtractFiltersProps {
  periodo: Periodo
  tag: Tag | 'all'
  onPeriodoChange: (p: Periodo) => void
  onTagChange: (t: Tag | 'all') => void
}

export function ExtractFilters({ periodo, tag, onPeriodoChange, onTagChange }: ExtractFiltersProps) {
  const t = useTranslation()
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'
  const PERIODS: { value: Periodo; label: string }[] = [
    { value: 'hoje', label: t.periods.hoje },
    { value: 'semana', label: t.periods.semana },
    { value: 'mes', label: t.periods.mes },
    { value: 'ultimo_mes', label: t.periods.ultimo_mes },
    { value: 'trimestre', label: t.periods.trimestre },
    { value: 'total', label: t.periods.total },
  ]
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
          <option value="all">{t.extrato.allCategories}</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {getCategoryLabel(c.value, locale)}
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
