'use client'

import type { Category, Periodo } from '@/lib/types'

interface ExtractFiltersProps {
  periodo: Periodo
  categoryId: string
  categories: Category[]
  onPeriodoChange: (period: Periodo) => void
  onCategoryChange: (categoryId: string) => void
  selectedMonth: number | null
  onMonthChange: (month: number | null) => void
  year: number
}

const periods: { value: Periodo; label: string }[] = [
  { value: 'mes', label: 'This month' },
  { value: 'semana', label: 'This week' },
  { value: 'hoje', label: 'Today' },
  { value: 'trimestre', label: 'This quarter' },
  { value: 'total', label: 'All year' },
]

export function ExtractFilters({
  periodo,
  categoryId,
  categories,
  onPeriodoChange,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  year,
}: ExtractFiltersProps) {
  const months = Array.from({ length: 12 }, (_, index) => {
    const name = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(new Date(2024, index, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })

  function handlePeriodChange(nextPeriod: Periodo) {
    onPeriodoChange(nextPeriod)
    onMonthChange(null)
  }

  return (
    <div className="space-y-3 px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <select
            value={periodo}
            onChange={(event) => handlePeriodChange(event.target.value as Periodo)}
            className={`w-full appearance-none rounded-xl border border-julius-border bg-julius-card px-3 py-2.5 text-sm font-medium text-julius-text transition focus:border-julius-accent focus:outline-none ${
              selectedMonth !== null ? 'text-julius-muted' : ''
            }`}
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-julius-muted">⌄</span>
        </div>

        <div className="relative">
          <select
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-julius-border bg-julius-card px-3 py-2.5 text-sm font-medium text-julius-text transition focus:border-julius-accent focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-julius-muted">⌄</span>
        </div>
      </div>

      <div className="relative">
        <select
          value={selectedMonth ?? ''}
          onChange={(event) => onMonthChange(event.target.value === '' ? null : Number(event.target.value))}
          className={`w-full appearance-none rounded-xl border border-julius-border bg-julius-card px-3 py-2.5 text-sm font-medium text-julius-text transition focus:border-julius-accent focus:outline-none ${
            selectedMonth === null ? 'text-julius-muted' : ''
          }`}
        >
          <option value="">Current period</option>
          {months.map((name, index) => (
            <option key={name} value={index}>
              {name} {year}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-julius-muted">⌄</span>
      </div>
    </div>
  )
}
