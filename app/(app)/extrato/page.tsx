'use client'

import { useState } from 'react'
import { ExtractFilters } from '@/components/extrato/ExtractFilters'
import { TransactionList } from '@/components/extrato/TransactionList'
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions'
import type { Periodo, Tag } from '@/lib/types'

export default function ExtratoPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [tag, setTag] = useState<Tag | 'all'>('all')

  const { data: transactions, isLoading } = useTransactions(periodo, tag === 'all' ? undefined : tag)
  const deleteTransaction = useDeleteTransaction()

  function handleDelete(id: string) {
    deleteTransaction.mutate(id)
  }

  return (
    <div>
      <ExtractFilters
        periodo={periodo}
        tag={tag}
        onPeriodoChange={setPeriodo}
        onTagChange={setTag}
      />
      <TransactionList
        transactions={transactions ?? []}
        isLoading={isLoading}
        onDelete={handleDelete}
      />
    </div>
  )
}
