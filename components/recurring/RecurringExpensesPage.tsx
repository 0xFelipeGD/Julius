'use client'

import { Check, PencilLine, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CategoryIcon } from '@/components/CategoryIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCategories } from '@/hooks/useCategories'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { getCategoryDisplay } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category, RecurringExpense, RecurringExpenseType } from '@/lib/types'
import type { SubscriptionInput } from '@/hooks/useSubscriptions'

const fallbackSegments = 'oklch(0.865 0.014 305) 0deg 360deg'

interface RecurringExpensesCopy {
  addButton: string
  createTitle: string
  editTitle: string
  createButton: string
  listTitle: string
  listSubtitle: string
  emptyTitle: string
  emptyDescription: string
  forecastEmpty: string
  namePlaceholder: string
  projectionAriaLabel: string
}

function buildDonutSegments(items: Array<{ amount: number; color: string }>, total: number): string {
  if (total <= 0) return fallbackSegments
  let cursor = 0
  return items
    .filter((item) => item.amount > 0)
    .map((item) => {
      const start = cursor
      const degrees = (item.amount / total) * 360
      cursor += degrees
      return `${item.color} ${start}deg ${cursor}deg`
    })
    .join(', ')
}

function formatDueDate(value: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(value)
}

function getTodayInputValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getDueDateInputValue(expense?: RecurringExpense | null): string {
  if (!expense) return getTodayInputValue()

  const anchor = expense.billing_anchor_month || getTodayInputValue().slice(0, 7) + '-01'
  const [year, month] = anchor.slice(0, 7).split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const day = Math.min(expense.payment_day, lastDay)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getMonthStartFromDateInput(value: string): string {
  const [year, month] = value.split('-')
  return `${year}-${month}-01`
}

function formatFrequency(months: number): string {
  if (months === 1) return 'monthly'
  if (months === 3) return 'quarterly'
  if (months === 6) return 'every 6 months'
  if (months === 12) return 'yearly'
  return `every ${months} months`
}

function findCategory(categories: Category[], expense?: RecurringExpense | null): Category | null {
  if (!expense) return categories[0] ?? null
  return (
    categories.find((category) => category.id === expense.category_id) ??
    expense.category ??
    categories.find((category) => category.is_fallback) ??
    categories[0] ??
    null
  )
}

function ProjectionPanel({
  projection,
  copy,
}: {
  projection: ReturnType<typeof useSubscriptions>['projection']
  copy: RecurringExpensesCopy
}) {
  const segments = buildDonutSegments(
    projection.byCategory.map((item) => ({
      amount: item.amount,
      color: item.category?.color ?? '#7C8191',
    })),
    projection.total
  )

  return (
    <section className="mx-4 mt-4 rounded-[24px] bg-julius-card p-4 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-julius-muted">Expected this month</p>
          <p className="mt-1 text-2xl font-semibold text-julius-text">{formatCurrency(projection.total)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-julius-muted">Paid</p>
          <p className="text-sm font-semibold text-julius-success">{formatCurrency(projection.paid)}</p>
          <p className="mt-1 text-xs text-julius-muted">Pending {formatCurrency(projection.pending)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="grid h-28 w-28 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${segments})` }}
          aria-label={copy.projectionAriaLabel}
        >
          <div className="h-[70px] w-[70px] rounded-full bg-julius-card" />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          {projection.byCategory.length === 0 ? (
            <p className="text-sm text-julius-muted">{copy.forecastEmpty}</p>
          ) : (
            projection.byCategory.map((item) => {
              const category = getCategoryDisplay(item.category)
              const pct = projection.total > 0 ? Math.round((item.amount / projection.total) * 100) : 0
              return (
                <div key={category.id} className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="truncate text-xs text-julius-muted">{category.name}</span>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-julius-text">
                      {formatCurrency(item.amount)} <span className="text-julius-muted">{pct}%</span>
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

function SubscriptionSheet({
  open,
  expense,
  categories,
  copy,
  onClose,
  onSubmit,
}: {
  open: boolean
  expense: RecurringExpense | null
  categories: Category[]
  copy: RecurringExpensesCopy
  onClose: () => void
  onSubmit: (input: SubscriptionInput) => void
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dueDate, setDueDate] = useState(getTodayInputValue())
  const [intervalMode, setIntervalMode] = useState('1')
  const [customInterval, setCustomInterval] = useState('2')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open) return
    const category = findCategory(categories, expense)
    const interval = Number(expense?.billing_interval_months ?? 1)
    setDescription(expense?.description ?? '')
    setAmount(expense ? String(expense.amount) : '')
    setCategoryId(category?.id ?? '')
    setDueDate(getDueDateInputValue(expense))
    setIntervalMode([1, 3, 6, 12].includes(interval) ? String(interval) : 'custom')
    setCustomInterval(String(interval))
    setNotes(expense?.notes ?? '')
  }, [open, expense, categories])

  if (!open) return null

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    const parsedInterval = intervalMode === 'custom' ? Number(customInterval) : Number(intervalMode)
    const parsedDay = Number(dueDate.split('-')[2])
    if (
      !description.trim() ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      !categoryId ||
      !dueDate ||
      parsedDay < 1 ||
      parsedDay > 31 ||
      Number.isNaN(parsedInterval) ||
      parsedInterval < 1 ||
      parsedInterval > 120
    ) return

    onSubmit({
      description: description.trim(),
      amount: parsedAmount,
      category_id: categoryId,
      payment_day: parsedDay,
      billing_interval_months: parsedInterval,
      billing_anchor_month: getMonthStartFromDateInput(dueDate),
      notes: notes.trim() || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-[rgba(38,29,52,0.42)]" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative max-h-[92dvh] overflow-y-auto rounded-t-[28px] bg-julius-card shadow-[0_-20px_60px_rgba(56,42,77,0.22)]"
      >
        <div className="px-4 pb-3 pt-4">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-julius-border" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-julius-text">
              {expense ? copy.editTitle : copy.createTitle}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-julius-muted transition hover:bg-julius-raised hover:text-julius-text"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-4 pb-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-julius-muted">Name</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={copy.namePlaceholder}
              className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Amount</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Frequency</span>
              <div className="relative">
                <select
                  value={intervalMode}
                  onChange={(event) => setIntervalMode(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
                >
                  <option value="1">Monthly</option>
                  <option value="3">Quarterly</option>
                  <option value="6">Every 6 months</option>
                  <option value="12">Yearly</option>
                  <option value="custom">Custom</option>
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-julius-muted">⌄</span>
              </div>
            </label>
            <label className={`block ${intervalMode === 'custom' ? '' : 'opacity-45'}`}>
              <span className="mb-1.5 block text-xs font-medium text-julius-muted">Every</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                value={customInterval}
                disabled={intervalMode !== 'custom'}
                onChange={(event) => setCustomInterval(event.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none disabled:opacity-60"
              />
            </label>
          </div>

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
            <span className="mb-1.5 block text-xs font-medium text-julius-muted">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
            />
          </label>
        </div>

        <div className="safe-bottom border-t border-julius-border px-4 py-3">
          <button className="w-full rounded-xl bg-julius-accent py-3 text-sm font-medium text-julius-on-accent transition active:scale-[0.98]">
            {expense ? 'Save changes' : copy.createButton}
          </button>
        </div>
      </form>
    </div>
  )
}

interface RecurringExpensesPageProps {
  expenseType: RecurringExpenseType
  copy: RecurringExpensesCopy
}

interface PendingConfirmation {
  title: string
  message: string
  confirmLabel: string
  destructive?: boolean
  action: () => void
}

export function RecurringExpensesPage({ expenseType, copy }: RecurringExpensesPageProps) {
  const { categories } = useCategories()
  const {
    expenses,
    projection,
    isLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    markPaid,
    unmarkPaid,
    skipPayment,
    getDueDate,
  } = useSubscriptions(expenseType)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null)

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => a.payment_day - b.payment_day || a.description.localeCompare(b.description)),
    [expenses]
  )

  function openCreate() {
    setEditingExpense(null)
    setSheetOpen(true)
  }

  function openEdit(expense: RecurringExpense) {
    setEditingExpense(expense)
    setSheetOpen(true)
  }

  function handleSubmit(input: SubscriptionInput) {
    if (editingExpense) {
      updateSubscription.mutate({ id: editingExpense.id, input })
    } else {
      createSubscription.mutate(input)
    }
    setSheetOpen(false)
  }

  function handleDelete(expense: RecurringExpense) {
    setPendingConfirmation({
      title: 'Delete recurring cost?',
      message: `${expense.description} will be removed. Existing transactions stay in your statement.`,
      confirmLabel: 'Delete',
      destructive: true,
      action: () => deleteSubscription.mutate(expense.id),
    })
  }

  function handleTogglePaid(expense: RecurringExpense) {
    const payment = expense.current_payment
    if (!payment) return

    if (payment.status === 'paid') {
      setPendingConfirmation({
        title: 'Unmark as paid?',
        message: `${expense.description} will go back to pending and the generated transaction will be removed.`,
        confirmLabel: 'Unmark',
        destructive: true,
        action: () => unmarkPaid.mutate(payment.id),
      })
      return
    }

    if (payment.status === 'skipped') {
      setPendingConfirmation({
        title: 'Undo skipped payment?',
        message: `${expense.description} will return to pending for this month.`,
        confirmLabel: 'Undo',
        action: () => unmarkPaid.mutate(payment.id),
      })
      return
    }

    setPendingConfirmation({
      title: 'Register payment?',
      message: `${expense.description} will be marked as paid and Julius will create a ${formatCurrency(expense.amount)} transaction.`,
      confirmLabel: 'Register',
      action: () => markPaid.mutate(payment.id),
    })
  }

  function handleSkipPayment(expense: RecurringExpense) {
    const payment = expense.current_payment
    if (!payment || payment.status === 'skipped') return

    setPendingConfirmation({
      title: 'Skip this payment?',
      message: `${expense.description} will be skipped for this month only. No transaction will be created.`,
      confirmLabel: 'Skip',
      action: () => skipPayment.mutate(payment.id),
    })
  }

  return (
    <div className="pb-5">
      <div className="px-4 pt-4">
        <button
          onClick={openCreate}
          disabled={categories.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-julius-accent px-4 py-3 text-sm font-medium text-julius-on-accent shadow-[0_14px_30px_rgba(93,45,136,0.22)] transition active:scale-[0.98] disabled:opacity-45"
        >
          <Plus className="h-4 w-4" />
          {copy.addButton}
        </button>
      </div>

      <ProjectionPanel projection={projection} copy={copy} />

      <section className="mx-4 mt-4 overflow-hidden rounded-[24px] bg-julius-card shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
        <div className="border-b border-julius-border px-4 py-3">
          <p className="text-sm font-semibold text-julius-text">{copy.listTitle}</p>
          <p className="text-xs text-julius-muted">{copy.listSubtitle}</p>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-julius-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-julius-border" />
                  <div className="h-3 w-20 animate-pulse rounded bg-julius-border" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedExpenses.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-julius-text">{copy.emptyTitle}</p>
            <p className="mt-1 text-sm text-julius-muted">{copy.emptyDescription}</p>
          </div>
        ) : (
          <div className="divide-y divide-julius-border">
            {sortedExpenses.map((expense) => {
              const category = getCategoryDisplay(findCategory(categories, expense), expense.category?.legacy_tag)
              const payment = expense.current_payment
              const isPaid = payment?.status === 'paid'
              const isSkipped = payment?.status === 'skipped'
              return (
                <article key={expense.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTogglePaid(expense)}
                      disabled={!payment || markPaid.isPending || unmarkPaid.isPending}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition active:scale-[0.98] ${
                        isPaid
                          ? 'border-julius-success/30 bg-julius-success-soft text-julius-success'
                          : isSkipped
                            ? 'border-julius-warning/30 bg-julius-warning-soft text-julius-warning'
                          : 'border-julius-border bg-julius-raised text-julius-muted'
                      }`}
                      aria-label={isPaid ? 'Unmark as paid' : isSkipped ? 'Undo skip' : 'Mark as paid'}
                    >
                      {isPaid ? <Check className="h-5 w-5" /> : isSkipped ? <X className="h-5 w-5" /> : <CategoryIcon icon={category.icon} className="h-4 w-4" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-julius-text">{expense.description}</p>
                        <p className="shrink-0 text-sm font-semibold text-julius-text">{formatCurrency(expense.amount)}</p>
                      </div>
                      <p className="truncate text-xs text-julius-muted">
                        {category.name} · {payment ? `due ${formatDueDate(getDueDate(expense.payment_day))}` : 'not due this month'} · {formatFrequency(Number(expense.billing_interval_months ?? 1))}
                        {isPaid ? ' · paid' : isSkipped ? ' · skipped' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    {payment && !isPaid && !isSkipped && (
                      <button
                        onClick={() => handleSkipPayment(expense)}
                        disabled={skipPayment.isPending}
                        className="flex h-9 items-center gap-1.5 rounded-xl border border-julius-border bg-julius-raised px-3 text-xs font-medium text-julius-muted transition hover:text-julius-text disabled:opacity-45"
                      >
                        Skip
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(expense)}
                      className="flex h-9 items-center gap-1.5 rounded-xl border border-julius-border bg-julius-raised px-3 text-xs font-medium text-julius-muted transition hover:text-julius-text"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense)}
                      className="flex h-9 items-center gap-1.5 rounded-xl border border-julius-danger/30 bg-julius-danger-soft px-3 text-xs font-medium text-julius-danger transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <SubscriptionSheet
        open={sheetOpen}
        expense={editingExpense}
        categories={categories}
        copy={copy}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(pendingConfirmation)}
        title={pendingConfirmation?.title ?? ''}
        message={pendingConfirmation?.message ?? ''}
        confirmLabel={pendingConfirmation?.confirmLabel ?? 'Confirm'}
        destructive={pendingConfirmation?.destructive}
        busy={deleteSubscription.isPending || markPaid.isPending || unmarkPaid.isPending || skipPayment.isPending}
        onClose={() => setPendingConfirmation(null)}
        onConfirm={() => {
          pendingConfirmation?.action()
          setPendingConfirmation(null)
        }}
      />
    </div>
  )
}
