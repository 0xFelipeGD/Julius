'use client'

import { useState, useMemo } from 'react'
import { ExtractFilters } from '@/components/extrato/ExtractFilters'
import { TransactionList } from '@/components/extrato/TransactionList'
import { EditTransactionModal } from '@/components/extrato/EditTransactionModal'
import { SearchBar } from '@/components/extrato/SearchBar'
import { useTransactions, useDeleteTransaction, useUpdateTransaction } from '@/hooks/useTransactions'
import { CATEGORY_LABELS } from '@/lib/categories'
import type { Periodo, Tag, Transacao } from '@/lib/types'
import { generateReport } from '@/lib/pdf/generateReport'
import { getCalendarDays } from '@/lib/utils/period'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useAppStore } from '@/stores/appStore'
import { getCurrencySymbol } from '@/lib/utils/currency'

function exportCSV(transactions: Transacao[], periodo: Periodo, currencySymbol: string) {
  const header = `Dia,Descrição,Valor (${currencySymbol}),Categoria`
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
  const [search, setSearch] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const year = useAppStore((s) => s.selectedYear)

  const { data: transactions, isLoading } = useTransactions(periodo, tag === 'all' ? undefined : tag, year, selectedMonth ?? undefined)
  const deleteTransaction = useDeleteTransaction()
  const updateTransaction = useUpdateTransaction()
  const currency = useUserSettingsStore((s) => s.currency)
  const currencySymbol = getCurrencySymbol(currency)

  // Apply search filter on top of fetched transactions
  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions ?? []
    const q = search.toLowerCase()
    return (transactions ?? []).filter((t) =>
      t.descricao.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[t.tag] ?? t.tag).toLowerCase().includes(q)
    )
  }, [transactions, search])

  function handleExportPDF() {
    if (!filteredTransactions.length) return
    const total = filteredTransactions.reduce((sum, t) => sum + Number(t.valor), 0)
    const average = total / getCalendarDays(periodo, year, selectedMonth ?? undefined)
    const periodLabel = selectedMonth !== null
      ? new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(new Date(year, selectedMonth, 1))
      : undefined
    const doc = generateReport({ transactions: filteredTransactions, periodo, year, currency, total, average, periodLabel })
    const slug = selectedMonth !== null ? `${year}-${String(selectedMonth + 1).padStart(2, '0')}` : periodo
    doc.save(`julius-relatorio-${slug}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  function handleDelete(id: string) { deleteTransaction.mutate(id) }
  function handleEdit(t: Transacao) { setEditingTransaction(t) }
  function handleSave(id: string, updates: { valor: number; tag: Tag; descricao: string; dia: string }) {
    updateTransaction.mutate({ id, updates })
  }

  return (
    <div>
      <div className="flex items-center justify-between pr-4">
        <ExtractFilters
          periodo={periodo}
          tag={tag}
          onPeriodoChange={setPeriodo}
          onTagChange={setTag}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          year={year}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(filteredTransactions, periodo, currencySymbol)}
            disabled={!filteredTransactions.length}
            title="Exportar CSV"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-julius-card border border-julius-border px-3 py-2.5 text-sm text-julius-muted transition-colors hover:text-julius-text disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={!filteredTransactions.length}
            title="Exportar PDF"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-julius-card border border-julius-border px-3 py-2.5 text-sm text-julius-muted transition-colors hover:text-julius-text disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      <TransactionList
        transactions={filteredTransactions}
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
