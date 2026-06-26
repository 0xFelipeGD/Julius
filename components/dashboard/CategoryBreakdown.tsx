'use client'

import { Cell, Pie, PieChart } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category, DayStats } from '@/lib/types'

interface CategoryBreakdownProps {
  data: DayStats[]
  categories: Category[]
  isLoading: boolean
}

export function CategoryBreakdown({ data, categories, isLoading }: CategoryBreakdownProps) {
  if (isLoading) {
    return (
      <div className="mx-4 h-[178px] rounded-[22px] bg-julius-card p-4">
        <div className="mb-5 h-4 w-24 animate-pulse rounded bg-julius-border" />
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 animate-pulse rounded-full bg-julius-border" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-julius-border" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-julius-border" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-julius-border" />
          </div>
        </div>
      </div>
    )
  }

  const totals = new Map<string, number>()
  for (const day of data) {
    for (const [categoryId, value] of Object.entries(day.por_categoria)) {
      totals.set(categoryId, (totals.get(categoryId) ?? 0) + Number(value))
    }
  }

  const total = Array.from(totals.values()).reduce((sum, value) => sum + value, 0)
  if (total <= 0) return null

  const pieData = categories
    .map((category) => ({
      key: category.id,
      label: category.name,
      amount: totals.get(category.id) ?? 0,
      color: category.color,
    }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <section className="mx-4 rounded-[22px] bg-julius-card p-4 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
      <p className="mb-4 text-xs font-semibold text-julius-muted">By category</p>
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <PieChart width={112} height={112}>
            <Pie
              data={pieData}
              cx={56}
              cy={56}
              innerRadius={34}
              outerRadius={52}
              dataKey="amount"
              strokeWidth={0}
            >
              {pieData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          {pieData.map((entry) => {
            const percentage = Math.round((entry.amount / total) * 100)
            return (
              <div key={entry.key}>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="truncate text-xs text-julius-muted">{entry.label}</span>
                  </div>
                  <span className="max-w-[56%] break-words text-right text-xs font-medium text-julius-text [overflow-wrap:anywhere]">
                    {formatCurrency(entry.amount)} <span className="text-julius-muted">{percentage}%</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-julius-border/70">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percentage}%`, backgroundColor: entry.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
