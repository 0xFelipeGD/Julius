'use client'

import { useRef, useEffect, useState } from 'react'
import { ExtractFilters } from '@/components/extrato/ExtractFilters'
import { TransactionList } from '@/components/extrato/TransactionList'
import { EditTransactionModal } from '@/components/extrato/EditTransactionModal'
import { useTransactions, useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { CATEGORY_LABELS } from '@/lib/categories'
import type { Periodo, Tag, Transacao } from '@/lib/types'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2024 }, (_, i) => 2025 + i)

function exportCSV(transactions: Transacao[], periodo: Periodo) {
  const header = 'Dia,Descrição,Valor (€),Categoria'
  const rows = transactions.map((t) => {
    const [year, month, day] = t.dia.split('-')
    const dia = `${day}/${month}/${year}`
    const descricao = `"${t.descricao.replace(/"/g, '""')}"`
    const valor = Number(t.valor).toFixed(2).replace('.', ',')
    const categoria = CATEGORY_LABELS[t.tag] ?? t.tag
    return `${dia},${descricao},${valor},${categoria}`
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `julius-extrato-${periodo}-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExtratoPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [tag, setTag] = useState<Tag | 'all'>('all')
  const [year, setYear] = useState(CURRENT_YEAR)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const yearScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = yearScrollRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [year])

  const { data: transactions, isLoading } = useTransactions(periodo, tag === 'all' ? undefined : tag, year)
  const deleteTransaction = useDeleteTransaction()
  const updateTransaction = useUpdateTransaction()

  function handleDelete(id: string) { deleteTransaction.mutate(id) }
  function handleEdit(t: Transacao) { setEditingTransaction(t) }
  function handleSave(id: string, updates: { valor: number; tag: Tag; descricao: string; dia: string }) {
    updateTransaction.mutate({ id, updates })
  }

  return (
    <div>
      {/* Selector de ano */}
      <div
        ref={yearScrollRef}
        className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 no-scrollbar"
      >
        {YEARS.map((y) => (
          <button
            key={y}
            data-active={y === year ? 'true' : 'false'}
            onClick={() => setYear(y)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              y === year
                ? 'bg-julius-accent text-white'
                : 'border border-julius-border bg-julius-card text-julius-muted'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pr-4">
        <ExtractFilters
          periodo={periodo}
          tag={tag}
          onPeriodoChange={setPeriodo}
          onTagChange={setTag}
        />
        <button
          onClick={() => exportCSV(transactions ?? [], periodo)}
          disabled={!transactions?.length}
          title="Exportar CSV"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-julius-card border border-julius-border px-3 py-2.5 text-sm text-julius-muted transition-colors hover:text-julius-text disabled:opacity-40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          CSV
        </button>
      </div>

      <TransactionList
        transactions={transactions ?? []}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <EditTransactionModal
        transaction={editingTransaction}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  )
}
