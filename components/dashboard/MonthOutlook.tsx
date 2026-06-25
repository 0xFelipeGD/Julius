'use client'

import { AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { SubscriptionProjection } from '@/hooks/useSubscriptions'

export interface DueAlert {
  id: string
  label: string
  type: string
  amount: number
  dueLabel: string
}

interface MonthOutlookProps {
  actualSpend: number
  pendingPlanned: number
  subscriptions: SubscriptionProjection
  fixedCosts: SubscriptionProjection
  dueAlerts: DueAlert[]
  isLoading: boolean
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((value / total) * 100)
}

function PlannedRow({
  label,
  projection,
  color,
}: {
  label: string
  projection: SubscriptionProjection
  color: string
}) {
  const paidPct = pct(projection.paid, projection.total)

  return (
    <div>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <p className="truncate text-sm font-semibold text-julius-text">{label}</p>
          </div>
          <p className="mt-0.5 truncate text-xs text-julius-muted">
            {formatCurrency(projection.paid)} paid, {paidPct}%
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-julius-text">{formatCurrency(projection.total)}</p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-julius-border/70">
        <div className="h-full rounded-full" style={{ width: `${paidPct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export function MonthOutlook({ actualSpend, pendingPlanned, subscriptions, fixedCosts, dueAlerts, isLoading }: MonthOutlookProps) {
  if (isLoading) {
    return (
      <section className="mx-4 rounded-[22px] bg-julius-card p-4">
        <div className="mb-4 h-4 w-28 animate-pulse rounded bg-julius-border" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 animate-pulse rounded-2xl bg-julius-border/70" />
          <div className="h-16 animate-pulse rounded-2xl bg-julius-border/70" />
        </div>
      </section>
    )
  }

  const plannedTotal = subscriptions.total + fixedCosts.total
  const plannedPaid = subscriptions.paid + fixedCosts.paid
  const recurringPaidPct = pct(plannedPaid, plannedTotal)
  const paidPct = pct(plannedPaid, plannedTotal)
  const pendingPct = pct(pendingPlanned, plannedTotal)

  return (
    <section className="mx-4 rounded-[22px] bg-julius-card p-4 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-julius-muted">Month outlook</p>
          <p className="mt-1 text-2xl font-semibold text-julius-text">{formatCurrency(plannedTotal)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-julius-muted">Pending planned</p>
          <p className="text-sm font-semibold text-julius-text">{formatCurrency(pendingPlanned)}</p>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-julius-border/70">
        <div className="flex h-full">
          <div className="h-full bg-julius-success" style={{ width: `${paidPct}%` }} />
          <div className="h-full bg-julius-accent" style={{ width: `${pendingPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-julius-raised px-3 py-3">
          <p className="text-xs text-julius-muted">Spent</p>
          <p className="mt-1 text-sm font-semibold text-julius-text">{formatCurrency(actualSpend)}</p>
        </div>
        <div className="rounded-2xl bg-julius-raised px-3 py-3">
          <p className="text-xs text-julius-muted">Projected</p>
          <p className="mt-1 text-sm font-semibold text-julius-text">{formatCurrency(plannedTotal)}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-julius-border pt-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-julius-muted">Expected recurring</p>
          <p className="text-xs font-medium text-julius-text">{recurringPaidPct}% paid</p>
        </div>
        {plannedTotal > 0 ? (
          <div className="space-y-3">
            <PlannedRow label="Subscriptions" projection={subscriptions} color="oklch(0.48 0.145 292)" />
            <PlannedRow label="Fixed costs" projection={fixedCosts} color="oklch(0.53 0.118 158)" />
          </div>
        ) : (
          <p className="rounded-2xl bg-julius-raised px-3 py-3 text-sm text-julius-muted">
            No subscriptions or fixed costs planned for this month.
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-julius-border pt-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-julius-warning" strokeWidth={1.9} />
          <p className="text-xs font-semibold text-julius-muted">Due soon</p>
        </div>
        {dueAlerts.length > 0 ? (
          <div className="space-y-2">
            {dueAlerts.slice(0, 4).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between gap-3 rounded-2xl bg-julius-raised px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-julius-text">{alert.label}</p>
                  <p className="text-xs text-julius-muted">{alert.type} · {alert.dueLabel}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-julius-text">{formatCurrency(alert.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-julius-raised px-3 py-3 text-sm text-julius-muted">
            No pending planned payments due in the next 7 days.
          </p>
        )}
      </div>
    </section>
  )
}
