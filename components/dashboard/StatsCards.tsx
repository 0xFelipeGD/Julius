'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { useUserSettingsStore } from '@/stores/userSettingsStore'

interface StatsCardsProps {
  total: number
  average: number
  isLoading: boolean
}

export function StatsCards({ total, average, isLoading }: StatsCardsProps) {
  const currency = useUserSettingsStore((s) => s.currency)
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      <div className="rounded-xl bg-julius-card p-4">
        <p className="text-xs text-julius-muted">Total do período</p>
        {isLoading ? (
          <div className="mt-1 h-7 w-24 animate-pulse rounded bg-julius-border" />
        ) : (
          <p className="mt-1 text-xl font-bold text-julius-text">{formatCurrency(total, currency)}</p>
        )}
      </div>
      <div className="rounded-xl bg-julius-card p-4">
        <p className="text-xs text-julius-muted">Média por dia</p>
        {isLoading ? (
          <div className="mt-1 h-7 w-24 animate-pulse rounded bg-julius-border" />
        ) : (
          <p className="mt-1 text-xl font-bold text-julius-text">{formatCurrency(average, currency)}</p>
        )}
      </div>
    </div>
  )
}
