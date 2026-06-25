'use client'

import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { EditTransactionModal } from '@/components/extrato/EditTransactionModal'
import { ExtractFilters } from '@/components/extrato/ExtractFilters'
import { SearchBar } from '@/components/extrato/SearchBar'
import { TransactionList } from '@/components/extrato/TransactionList'
import { useCategories } from '@/hooks/useCategories'
import { useDeleteTransaction, useTransactions, useUpdateTransaction } from '@/hooks/useTransactions'
import { getCategoryDisplay } from '@/lib/categories'
import { generateReport } from '@/lib/pdf/generateReport'
import { getCurrencySymbol } from '@/lib/utils/currency'
import { getCalendarDays } from '@/lib/utils/period'
import { useAppStore } from '@/stores/appStore'
import type { Periodo, Transacao } from '@/lib/types'

function getTransactionCategoryName(transaction: Transacao): string {
  return getCategoryDisplay(transaction.category, transaction.tag).name
}

function exportCSV(transactions: Transacao[], periodo: Periodo, currencySymbol: string) {
  const header = `Date,Description,Amount (${currencySymbol}),Category`
  const rows = transactions.map((transaction) => {
    const [year, month, day] = transaction.dia.split('-')
    const date = `${day}/${month}/${year}`
    const description = `"${transaction.descricao.replace(/"/g, '""')}"`
    const amount = Number(transaction.valor).toFixed(2)
    const category = `"${getTransactionCategoryName(transaction).replace(/"/g, '""')}"`
    return `${date},${description},${amount},${category}`
  })
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `julius-statement-${periodo}-${new Date().toISOString().split('T')[0]}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function StatementPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const year = useAppStore((state) => state.selectedYear)
  const { categories } = useCategories()

  const { data: transactions, isLoading } = useTransactions(
    periodo,
    categoryId === 'all' ? undefined : categoryId,
    year,
    selectedMonth ?? undefined
  )
  const deleteTransaction = useDeleteTransaction()
  const updateTransaction = useUpdateTransaction()
  const currencySymbol = getCurrencySymbol()

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions ?? []
    const query = search.toLowerCase()
    return (transactions ?? []).filter((transaction) =>
      transaction.descricao.toLowerCase().includes(query) ||
      getTransactionCategoryName(transaction).toLowerCase().includes(query)
    )
  }, [transactions, search])

  function handleExportPDF() {
    if (!filteredTransactions.length) return
    const total = filteredTransactions.reduce((sum, transaction) => sum + Number(transaction.valor), 0)
    const average = total / getCalendarDays(periodo, year, selectedMonth ?? undefined)
    const periodLabel = selectedMonth !== null
      ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(year, selectedMonth, 1))
      : undefined
    const doc = generateReport({
      transactions: filteredTransactions,
      periodo,
      year,
      currency: 'EUR',
      total,
      average,
      periodLabel,
      categories,
    })
    const slug = selectedMonth !== null ? `${year}-${String(selectedMonth + 1).padStart(2, '0')}` : periodo
    doc.save(`julius-statement-${slug}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  function handleSave(id: string, updates: { valor: number; category_id: string; descricao: string; dia: string }) {
    updateTransaction.mutate({ id, updates })
  }

  return (
    <div className="pb-5">
      <ExtractFilters
        periodo={periodo}
        categoryId={categoryId}
        categories={categories}
        onPeriodoChange={setPeriodo}
        onCategoryChange={setCategoryId}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        year={year}
      />

      <div className="px-4 pb-3">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <section className="mx-4 mb-3 rounded-[20px] bg-julius-card p-3 shadow-[0_14px_34px_rgba(56,42,77,0.08)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-julius-text">Reports</p>
          <p className="text-xs font-medium text-julius-muted">{filteredTransactions.length} items</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportPDF}
            disabled={!filteredTransactions.length}
            className="flex items-center justify-center gap-2 rounded-xl bg-julius-accent px-3 py-3 text-sm font-medium text-julius-on-accent transition active:scale-[0.98] disabled:opacity-40"
          >
            <FileText className="h-4 w-4" />
            PDF
          </button>
          <button
            onClick={() => exportCSV(filteredTransactions, periodo, currencySymbol)}
            disabled={!filteredTransactions.length}
            className="flex items-center justify-center gap-2 rounded-xl border border-julius-border bg-julius-raised px-3 py-3 text-sm font-medium text-julius-muted transition hover:text-julius-text active:scale-[0.98] disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </section>

      <TransactionList
        transactions={filteredTransactions}
        isLoading={isLoading}
        onDelete={(id) => deleteTransaction.mutate(id)}
        onEdit={setEditingTransaction}
      />

      <EditTransactionModal
        transaction={editingTransaction}
        categories={categories}
        onSave={handleSave}
        onDelete={(id) => deleteTransaction.mutate(id)}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  )
}
