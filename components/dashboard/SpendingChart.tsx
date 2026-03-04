'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDayMonth } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { DayStats } from '@/lib/types'

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

const CATEGORY_COLORS: Record<string, string> = {
  Alimentacao: '#16A34A',
  Transporte: '#2563EB',
  Saude: '#DC2626',
  Lazer: '#9333EA',
  Habitacao: '#CA8A04',
  Outros: '#64748B',
}

const CATEGORY_LABELS: Record<string, string> = {
  Alimentacao: 'Alimentação',
  Transporte: 'Transporte',
  Saude: 'Saúde',
  Lazer: 'Lazer',
  Habitacao: 'Habitação',
  Outros: 'Outros',
}

export function SpendingChart({ data, isLoading }: SpendingChartProps) {
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

  return (
    <div className="mx-4 rounded-xl bg-julius-card p-4">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
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
            width={45}
            tickFormatter={(v) => `${v}€`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="a"
              fill={color}
              radius={key === 'Outros' ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              name={CATEGORY_LABELS[key]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
