'use client'

import type { Periodo } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getRegionConfig } from '@/lib/config/regions'

interface PeriodFilterProps {
  selected: Periodo
  onChange: (p: Periodo) => void
  selectedMonth: number | null
  onMonthChange: (m: number | null) => void
  year: number
}

export function PeriodFilter({ selected, onChange, selectedMonth, onMonthChange, year }: PeriodFilterProps) {
  const t = useTranslation()
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'

  const PERIODS: { value: Periodo; label: string }[] = [
    { value: 'mes', label: t.periods.mes },
    { value: 'semana', label: t.periods.semana },
    { value: 'hoje', label: t.periods.hoje },
    { value: 'trimestre', label: t.periods.trimestre },
    { value: 'total', label: t.periods.total },
  ]

  const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const name = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, i, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })

  function handlePeriodChange(p: Periodo) {
    onChange(p)
    onMonthChange(null)
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    onMonthChange(val === '' ? null : Number(val))
  }

  const selectClass = (active: boolean) =>
    `w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer transition-opacity ${active ? '' : 'opacity-40'}`

  const chevron = (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Period quick filter */}
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => handlePeriodChange(e.target.value as Periodo)}
          className={selectClass(selectedMonth === null)}
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {chevron}
      </div>

      {/* Month picker */}
      <div className="relative">
        <select
          value={selectedMonth ?? ''}
          onChange={handleMonthChange}
          className={selectClass(selectedMonth !== null)}
        >
          <option value="">— Mês específico —</option>
          {MONTHS.map((name, i) => (
            <option key={i} value={i}>{name} {year}</option>
          ))}
        </select>
        {chevron}
      </div>
    </div>
  )
}
