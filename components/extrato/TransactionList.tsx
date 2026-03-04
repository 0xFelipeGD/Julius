'use client'

import { TransactionItem } from './TransactionItem'
import { formatDate } from '@/lib/utils/date'
import { formatCurrency } from '@/lib/utils/currency'
import type { Transacao } from '@/lib/types'

interface TransactionListProps {
  transactions: Transacao[]
  isLoading: boolean
  onDelete: (id: string) => void
}

function groupByDay(transactions: Transacao[]): Map<string, Transacao[]> {
  const groups = new Map<string, Transacao[]>()
  for (const t of transactions) {
    const existing = groups.get(t.dia) ?? []
    existing.push(t)
    groups.set(t.dia, existing)
  }
  return groups
}

export function TransactionList({ transactions, isLoading, onDelete }: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 px-4 py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-julius-card" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-julius-card" />
              <div className="h-3 w-20 animate-pulse rounded bg-julius-card" />
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-julius-card" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-8">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-julius-card">
          <span className="text-2xl">🤔</span>
        </div>
        <p className="text-sm text-julius-muted">
          Ou não gastaste nada, ou estás a esconder-me alguma coisa.
        </p>
      </div>
    )
  }

  const grouped = groupByDay(transactions)

  return (
    <div className="pb-4">
      {Array.from(grouped.entries()).map(([dia, items]) => {
        const dayTotal = items.reduce((sum, t) => sum + Number(t.valor), 0)
        return (
          <div key={dia}>
            <div className="flex items-center justify-between px-4 py-2 bg-julius-bg/50">
              <p className="text-xs font-medium text-julius-muted">{formatDate(dia)}</p>
              <p className="text-xs font-medium text-julius-muted">{formatCurrency(dayTotal)}</p>
            </div>
            {items.map((t) => (
              <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
