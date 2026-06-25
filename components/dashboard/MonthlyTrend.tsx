'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/currency'
import type { MonthlyTrendPoint } from '@/hooks/useMonthlyTrend'

interface MonthlyTrendProps {
  data: MonthlyTrendPoint[]
  isLoading: boolean
  year: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function TrendTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-julius-border bg-julius-card p-3 shadow-[0_14px_34px_rgba(56,42,77,0.14)]">
      <p className="text-xs text-julius-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-julius-text">{formatCurrency(Number(payload[0].value))}</p>
    </div>
  )
}

export function MonthlyTrend({ data, isLoading, year }: MonthlyTrendProps) {
  const currencySymbol = getCurrencySymbol()
  const hasData = data.some((point) => point.total > 0)

  if (isLoading) {
    return (
      <section className="mx-4 h-[210px] rounded-[22px] bg-julius-card p-4">
        <div className="mb-6 h-4 w-28 animate-pulse rounded bg-julius-border" />
        <div className="h-[140px] animate-pulse rounded-2xl bg-julius-border/60" />
      </section>
    )
  }

  return (
    <section className="mx-4 rounded-[22px] bg-julius-card p-4 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-julius-muted">Monthly evolution</p>
          <p className="mt-0.5 text-sm font-medium text-julius-text">{year}</p>
        </div>
        {hasData && <p className="text-xs text-julius-muted">actual spend</p>}
      </div>

      {hasData ? (
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 6, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'oklch(0.52 0.026 296)', fontSize: 11 }}
                axisLine={{ stroke: 'oklch(0.865 0.014 305)' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fill: 'oklch(0.52 0.026 296)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={44}
                tickFormatter={(value) => `${currencySymbol}${value}`}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'oklch(0.48 0.145 292 / 0.28)', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="oklch(0.48 0.145 292)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: 'oklch(0.985 0.006 112)' }}
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[150px] items-center justify-center rounded-2xl bg-julius-raised px-8 text-center">
          <p className="text-sm text-julius-muted">No monthly spending history for this year yet.</p>
        </div>
      )}
    </section>
  )
}
