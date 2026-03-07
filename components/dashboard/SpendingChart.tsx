'use client'

import { useRef, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { formatDayMonth } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import { CATEGORIES } from '@/lib/categories'
import type { DayStats } from '@/lib/types'

const MIN_WIDTH_PER_BAR = 44

interface SpendingChartProps {
  data: DayStats[]
  isLoading: boolean
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, p) => sum + p.value, 0)

  return (
    <div className="rounded-lg bg-julius-card border border-julius-border p-3 shadow-lg">
      <p className="text-xs text-julius-muted mb-1">{label}</p>
      <p className="text-sm font-bold text-julius-text">{formatCurrency(total)}</p>
      {payload
        .filter((p) => p.value > 0)
        .map((p) => (
          <p key={p.name} className="text-xs text-julius-muted">
            <span style={{ color: p.color }}>●</span> {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
    </div>
  )
}

export function SpendingChart({ data, isLoading }: SpendingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(320)

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        // subtract horizontal padding (p-4 = 32px total)
        setContainerWidth(containerRef.current.offsetWidth - 32)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  if (isLoading) {
    return (
      <div className="mx-4 flex h-[220px] items-center justify-center rounded-xl bg-julius-card">
        <p className="text-sm text-julius-muted">Julius está a calcular...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="mx-4 flex h-[220px] items-center justify-center rounded-xl bg-julius-card">
        <p className="text-sm text-julius-muted">Sem dados para mostrar. O Julius aprova!</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    dia: formatDayMonth(d.dia),
    ...d.por_categoria,
  }))

  // Garante que cada barra tem pelo menos MIN_WIDTH_PER_BAR px
  const chartWidth = Math.max(data.length * MIN_WIDTH_PER_BAR, containerWidth)
  const isScrollable = chartWidth > containerWidth

  return (
    <div ref={containerRef} className="mx-4 rounded-xl bg-julius-card p-4 overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-julius-muted">Gastos por dia</p>
        {isScrollable && (
          <p className="text-xs text-julius-muted">← desliza</p>
        )}
      </div>
      <div className="overflow-x-auto">
        <div style={{ width: `${chartWidth}px` }}>
          <BarChart width={chartWidth} height={220} data={chartData}>
            <XAxis
              dataKey="dia"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            {CATEGORIES.map((cat, idx) => (
              <Bar
                key={cat.value}
                dataKey={cat.value}
                stackId="a"
                fill={cat.color}
                radius={idx === CATEGORIES.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                name={cat.label}
              />
            ))}
          </BarChart>
        </div>
      </div>
    </div>
  )
}
