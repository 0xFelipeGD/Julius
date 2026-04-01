'use client'

import { useState } from 'react'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { useStats } from '@/hooks/useStats'
import { CATEGORIES, getCategoryLabel } from '@/lib/categories'
import { useAppStore } from '@/stores/appStore'
import { useTranslation } from '@/lib/i18n'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getRegionConfig } from '@/lib/config/regions'
import type { Periodo, Tag } from '@/lib/types'

export default function DashboardPage() {
  const t = useTranslation()
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [tag, setTag] = useState<Tag | 'all'>('all')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const year = useAppStore((s) => s.selectedYear)

  const { data, isLoading } = useStats(periodo, tag === 'all' ? undefined : tag, year, selectedMonth ?? undefined)

  const MONTHS = Array.from({ length: 12 }, (_, i) => {
    const name = new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, i, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })

  function handlePeriodChange(p: Periodo) {
    setPeriodo(p)
    setSelectedMonth(null)
  }

  return (
    <div className="pb-4">
      <div className="flex flex-col gap-2 px-4 py-3">
        {/* Linha 1: período + categoria */}
        <div className="flex gap-3">
          <div className="flex-1">
            <PeriodFilter selected={periodo} onChange={handlePeriodChange} dimmed={selectedMonth !== null} />
          </div>
          <div className="relative flex-1">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as Tag | 'all')}
              className="w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer"
            >
              <option value="all">{t.dashboard.allCategories}</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{getCategoryLabel(c.value, locale)}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Linha 2: mês específico (full width) */}
        <div className="relative">
          <select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(e.target.value === '' ? null : Number(e.target.value))}
            className={`w-full appearance-none bg-julius-card text-julius-text border border-julius-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-julius-accent cursor-pointer transition-opacity ${selectedMonth === null ? 'opacity-40' : ''}`}
          >
            <option value="">— Mês específico —</option>
            {MONTHS.map((name, i) => (
              <option key={i} value={i}>{name} {year}</option>
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
