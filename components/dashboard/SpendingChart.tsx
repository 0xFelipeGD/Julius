'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDayMonth } from '@/lib/utils/date'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/currency'
import type { Category, DayStats } from '@/lib/types'

interface SpendingChartProps {
  data: DayStats[]
  categories: Category[]
  isLoading: boolean
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null

  const visiblePayload = payload.filter((item) => Number(item.value) > 0)
  const total = visiblePayload.reduce((sum, item) => sum + Number(item.value), 0)
  if (total <= 0) return null

  return (
    <div className="rounded-xl border border-julius-border bg-julius-card p-3 shadow-[0_14px_34px_rgba(56,42,77,0.14)]">
      <p className="mb-1 text-xs text-julius-muted">{label}</p>
      <p className="text-sm font-semibold text-julius-text">{formatCurrency(total)}</p>
      <div className="mt-2 space-y-1">
        {visiblePayload.map((item) => (
          <p key={item.name} className="text-xs text-julius-muted">
            <span style={{ color: item.color }}>●</span> {item.name}: {formatCurrency(Number(item.value))}
          </p>
        ))}
      </div>
    </div>
  )
}

export function SpendingChart({ data, categories, isLoading }: SpendingChartProps) {
  const currencySymbol = getCurrencySymbol()

  const activeCategories = useMemo(() => {
    const seen = new Set<string>()
    for (const day of data) {
      for (const [key, value] of Object.entries(day.por_categoria)) {
        if (Number(value) > 0) seen.add(key)
      }
    }
    return categories.filter((category) => seen.has(category.id))
  }, [categories, data])

  if (isLoading) {
    return (
      <div className="mx-4 h-[250px] rounded-[22px] bg-julius-card p-4">
        <div className="mb-5 h-4 w-28 animate-pulse rounded bg-julius-border" />
        <div className="flex h-[190px] items-end gap-2">
          {[42, 70, 46, 110, 84, 132, 62].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-lg bg-julius-border/70" style={{ height }} />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0 || activeCategories.length === 0) {
    return (
      <div className="mx-4 flex h-[220px] items-center justify-center rounded-[22px] bg-julius-card px-8 text-center">
        <p className="text-sm text-julius-muted">No spending recorded for this view.</p>
      </div>
    )
  }

  const chartData = data.map((day) => ({
    dia: formatDayMonth(day.dia),
    ...day.por_categoria,
  }))
  const tickInterval = data.length > 14 ? Math.ceil(data.length / 8) - 1 : 0

  return (
    <div className="mx-4 overflow-hidden rounded-[22px] bg-julius-card p-4 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold text-julius-muted">Spending by day</p>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 6, right: 4, left: -8, bottom: 0 }} barCategoryGap={2}>
            <XAxis
              dataKey="dia"
              interval={tickInterval}
              tick={{ fill: 'oklch(0.52 0.026 296)', fontSize: 11 }}
              axisLine={{ stroke: 'oklch(0.865 0.014 305)' }}
              tickLine={false}
              minTickGap={4}
            />
            <YAxis
              tick={{ fill: 'oklch(0.52 0.026 296)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(value) => `${currencySymbol}${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(0.925 0.045 303 / 0.32)' }} />
            {activeCategories.map((category, index) => (
              <Bar
                key={category.id}
                dataKey={category.id}
                stackId="a"
                fill={category.color}
                radius={index === activeCategories.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                name={category.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
