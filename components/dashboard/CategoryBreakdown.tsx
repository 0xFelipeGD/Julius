'use client'

import { PieChart, Pie, Cell } from 'recharts'
import { CATEGORIES, getCategoryLabel } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useTranslation } from '@/lib/i18n'
import { getRegionConfig } from '@/lib/config/regions'
import type { DayStats } from '@/lib/types'

interface CategoryBreakdownProps {
  data: DayStats[]
  isLoading: boolean
}

export function CategoryBreakdown({ data, isLoading }: CategoryBreakdownProps) {
  const t = useTranslation()
  const currency = useUserSettingsStore((s) => s.currency)
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'

  if (isLoading) {
    return (
      <div className="mx-4 flex h-[140px] items-center justify-center rounded-xl bg-julius-card">
        <p className="text-sm text-julius-muted">{t.dashboard.calculating}</p>
      </div>
    )
  }

  const totals: Record<string, number> = {}
  for (const day of data) {
    for (const [cat, val] of Object.entries(day.por_categoria)) {
      totals[cat] = (totals[cat] ?? 0) + (val as number)
    }
  }

  const total = Object.values(totals).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const pieData = CATEGORIES
    .map((cat) => ({ key: cat.value, label: getCategoryLabel(cat.value, locale), amount: totals[cat.value] ?? 0, color: cat.color }))
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="mx-4 rounded-xl bg-julius-card p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-julius-muted">
        {t.dashboard.byCategory}
      </p>
      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="shrink-0">
          <PieChart width={110} height={110}>
            <Pie
              data={pieData}
              cx={50}
              cy={50}
              innerRadius={32}
              outerRadius={50}
              dataKey="amount"
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>

        {/* Lista com mini barras */}
        <div className="flex-1 space-y-2.5 min-w-0">
          {pieData.map((d) => {
            const pct = Math.round((d.amount / total) * 100)
            return (
              <div key={d.key}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="truncate text-xs text-julius-muted">{d.label}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-xs font-medium text-julius-text">
                    {formatCurrency(d.amount, currency)}{' '}
                    <span className="text-julius-muted">{pct}%</span>
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-julius-border">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: d.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
