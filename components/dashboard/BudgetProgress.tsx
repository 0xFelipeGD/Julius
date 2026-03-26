'use client'

import { formatCurrency } from '@/lib/utils/currency'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useStats } from '@/hooks/useStats'
import { useTranslation } from '@/lib/i18n'
import type { Tag } from '@/lib/types'

interface BudgetProgressProps {
  tag: Tag | 'all'
}

function ProgressBar({ value, max, color }: { value: number; max: number | null | undefined; color: string }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0
  const over = max != null && max > 0 && value > max
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-julius-border">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: over ? '#DC2626' : color }}
      />
    </div>
  )
}

export function BudgetProgress({ tag }: BudgetProgressProps) {
  const t = useTranslation()
  const { limites, currency } = useUserSettingsStore()
  const tagParam = tag === 'all' ? undefined : tag
  const { data: todayData } = useStats('hoje', tagParam)
  const { data: mesData } = useStats('mes', tagParam)

  const limite = limites[tag]
  const todayTotal = todayData?.total ?? 0
  const monthTotal = mesData?.total ?? 0

  // Se não há limite definido para nenhum período, não renderiza
  if (limite?.diario == null && limite?.mensal == null) return null

  return (
    <div className="mx-4 rounded-xl bg-julius-card p-4 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-julius-muted">{t.dashboard.limits}</p>

      {limite?.diario != null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-julius-muted">{t.dashboard.today}</span>
            <span className="text-xs font-medium text-julius-text">
              {formatCurrency(todayTotal, currency)}{' '}
              <span className="text-julius-muted">/ {formatCurrency(limite.diario, currency)}</span>
            </span>
          </div>
          <ProgressBar value={todayTotal} max={limite.diario} color="#2563EB" />
          {todayTotal > limite.diario ? (
            <p className="mt-1 text-xs text-julius-danger">
              +{formatCurrency(todayTotal - limite.diario, currency)} {t.dashboard.above}
            </p>
          ) : (
            <p className="mt-1 text-xs text-julius-muted">
              {t.dashboard.canSpend} {formatCurrency(limite.diario - todayTotal, currency)} {t.dashboard.today.toLowerCase()}
            </p>
          )}
        </div>
      )}

      {limite?.mensal != null && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-julius-muted">{t.dashboard.thisMonth}</span>
            <span className="text-xs font-medium text-julius-text">
              {formatCurrency(monthTotal, currency)}{' '}
              <span className="text-julius-muted">/ {formatCurrency(limite.mensal, currency)}</span>
            </span>
          </div>
          <ProgressBar value={monthTotal} max={limite.mensal} color="#16A34A" />
          {monthTotal > limite.mensal ? (
            <p className="mt-1 text-xs text-julius-danger">
              +{formatCurrency(monthTotal - limite.mensal, currency)} {t.dashboard.above}
            </p>
          ) : (
            <p className="mt-1 text-xs text-julius-muted">
              {t.dashboard.canSpend} {formatCurrency(limite.mensal - monthTotal, currency)} {t.dashboard.thisMonth.toLowerCase()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
