'use client'

import { Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getCategoryDisplay } from '@/lib/categories'
import type { Category, Transacao } from '@/lib/types'

interface EditTransactionModalProps {
  transaction: Transacao | null
  categories: Category[]
  onSave: (id: string, updates: { valor: number; category_id: string; descricao: string; dia: string }) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function EditTransactionModal({ transaction, categories, onSave, onDelete, onClose }: EditTransactionModalProps) {
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!transaction) return
    const display = getCategoryDisplay(transaction.category, transaction.tag)
    const fallbackCategory = categories.find((category) => category.id === transaction.category_id)
      ?? categories.find((category) => category.name === display.name)
      ?? categories.find((category) => category.is_fallback)
      ?? categories[0]

    setAmount(String(transaction.valor))
    setCategoryId(fallbackCategory?.id ?? transaction.category_id ?? '')
    setDescription(transaction.descricao)
    setDate(transaction.dia)
  }, [transaction, categories])

  if (!transaction) return null
  const activeTransaction = transaction

  async function handleSave() {
    if (saving) return
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0 || !description.trim() || !date || !categoryId) return

    setSaving(true)
    try {
      onSave(activeTransaction.id, {
        valor: parsedAmount,
        category_id: categoryId,
        descricao: description.trim(),
        dia: date,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  function handleDelete() {
    setDeleteOpen(true)
  }

  function confirmDelete() {
    onDelete(activeTransaction.id)
    setDeleteOpen(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[rgba(38,29,52,0.42)]" onClick={onClose} />

      <div className="relative flex max-h-[90dvh] flex-col rounded-t-[28px] bg-julius-card shadow-[0_-20px_60px_rgba(56,42,77,0.22)]">
        <div className="shrink-0 px-4 pb-3 pt-4">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-julius-border" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-julius-text">Edit transaction</h2>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-julius-muted transition hover:bg-julius-raised hover:text-julius-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Description</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Amount</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Category</span>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-julius-muted">⌄</span>
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
              />
            </label>
          </div>
        </div>

        <div className="safe-bottom flex shrink-0 gap-3 border-t border-julius-border px-4 py-3">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 rounded-xl border border-julius-danger/30 bg-julius-danger-soft px-4 py-3 text-sm font-medium text-julius-danger transition active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !description.trim() || !amount || !date || !categoryId}
            className="flex-1 rounded-xl bg-julius-accent py-3 text-sm font-medium text-julius-on-accent transition active:scale-[0.98] disabled:opacity-45"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete transaction?"
        message="This transaction will be removed from your statement."
        confirmLabel="Delete"
        destructive
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
