'use client'

import { useRef, useEffect, useState } from 'react'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { useStats } from '@/hooks/useStats'
import { CATEGORIES } from '@/lib/categories'
import type { Periodo, Tag } from '@/lib/types'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2024 }, (_, i) => 2025 + i)

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [tag, setTag] = useState<Tag | 'all'>('all')
  const [year, setYear] = useState(CURRENT_YEAR)
  const yearScrollRef = useRef<HTMLDivElement>(null)

  // Scroll ao ano activo quando muda
  useEffect(() => {
    const el = yearScrollRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [year])

  const { data, isLoading } = useStats(periodo, tag === 'all' ? undefined : tag, year)

  return (
    <div className="pb-4">
      {/* Selector de ano — chips horizontais */}
      <div
        ref={yearScrollRef}
        className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 no-scrollbar"
      >
        {YEARS.map((y) => (
          <button
            key={y}
            data-active={y === year ? 'true' : 'false'}
            onClick={() => setYear(y)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              y === year
                ? 'bg-julius-accent text-white'
                : 'border border-julius-border bg-julius-card text-julius-muted'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Filtros período + categoria */}
      <div className="flex gap-3 px-4 py-3">
        <div className="flex-1">
          <PeriodFilter selected={periodo} onChange={setPeriodo} />
        </div>
        <div className="relative flex-1">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as Tag | 'all')}
            className="w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer"
          >
            <option value="all">Tudo</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <StatsCards
        total={data?.total ?? 0}
        average={data?.average ?? 0}
        isLoading={isLoading}
      />

      <div className="mt-4 space-y-4">
        <BudgetProgress tag={tag} />
        <SpendingChart data={data?.dayStats ?? []} isLoading={isLoading} />
        <CategoryBreakdown data={data?.dayStats ?? []} isLoading={isLoading} />
      </div>
    </div>
  )
}
