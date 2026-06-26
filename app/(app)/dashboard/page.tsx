'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CategoryIcon } from '@/components/CategoryIcon'
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown'
import { MonthOutlook } from '@/components/dashboard/MonthOutlook'
import { MonthlyTrend } from '@/components/dashboard/MonthlyTrend'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { useCategories } from '@/hooks/useCategories'
import { useMonthlyTrend } from '@/hooks/useMonthlyTrend'
import { useStats } from '@/hooks/useStats'
import { getMonthStart, useSubscriptions } from '@/hooks/useSubscriptions'
import { useAppStore } from '@/stores/appStore'
import type { Category, Periodo, RecurringExpense } from '@/lib/types'
import type { DueAlert } from '@/components/dashboard/MonthOutlook'

function formatDueLabel(dueDate: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  const days = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0) return 'overdue'
  if (days === 0) return 'today'
  if (days === 1) return 'tomorrow'
  return `in ${days} days`
}

function buildDueAlerts(
  expenses: RecurringExpense[],
  getDueDate: (paymentDay: number) => Date,
  type: string
): DueAlert[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + 7)

  return expenses
    .filter((expense) => expense.current_payment && expense.current_payment.status !== 'paid')
    .map((expense) => {
      const dueDate = getDueDate(expense.payment_day)
      return {
        id: `${type}-${expense.id}`,
        label: expense.description,
        type,
        amount: Number(expense.amount),
        dueDate,
        dueLabel: formatDueLabel(dueDate),
      }
    })
    .filter((alert) => alert.dueDate <= horizon)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

function CategoryMultiSelect({
  categories,
  selectedIds,
  onChange,
}: {
  categories: Category[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedCategories = useMemo(
    () => categories.filter((category) => selectedSet.has(category.id)),
    [categories, selectedSet]
  )
  const allSelected = selectedIds.length === 0 || selectedIds.length === categories.length
  const summary = allSelected
    ? 'All categories'
    : selectedCategories.length === 1
      ? selectedCategories[0].name
      : `${selectedCategories.length} categories`

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  function toggleCategory(categoryId: string) {
    if (selectedIds.length === 0) {
      onChange([categoryId])
      return
    }

    const next = selectedSet.has(categoryId)
      ? selectedIds.filter((id) => id !== categoryId)
      : [...selectedIds, categoryId]
    onChange(next.length === categories.length ? [] : next)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex h-12 w-full min-w-0 items-center gap-3 rounded-xl border border-julius-border bg-julius-card px-3 text-left text-julius-text transition focus:border-julius-accent focus:outline-none"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold text-julius-muted">Categories</span>
          <span className="block truncate text-sm font-medium">{summary}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-julius-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-2xl border border-julius-border bg-julius-card p-2 shadow-[0_18px_42px_rgba(56,42,77,0.14)]">
          <button
            type="button"
            onClick={() => onChange([])}
            className={`mb-1 flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl px-2 text-left transition ${
              allSelected ? 'bg-julius-accent-soft text-julius-accent' : 'text-julius-muted hover:bg-julius-raised'
            }`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-julius-border bg-julius-raised">
              {allSelected && <Check className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">All categories</span>
          </button>

          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
            {categories.map((category) => {
              const selected = allSelected || selectedSet.has(category.id)
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl px-2 text-left transition ${
                    selected && !allSelected
                      ? 'bg-julius-accent-soft text-julius-accent'
                      : 'text-julius-text hover:bg-julius-raised'
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${category.color}22`, color: category.color }}
                  >
                    <CategoryIcon icon={category.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.name}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-julius-border bg-julius-card">
                    {selected && !allSelected && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const year = useAppStore((state) => state.selectedYear)
  const { categories } = useCategories()
  const activeCategoryIds = selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined
  const forecastMonth = selectedMonth !== null ? getMonthStart(year, selectedMonth) : undefined
  const subscriptionForecast = useSubscriptions('subscription', forecastMonth)
  const fixedCostForecast = useSubscriptions('fixed_cost', forecastMonth)
  const monthlyTrend = useMonthlyTrend(year, activeCategoryIds)

  const { data, isLoading } = useStats(
    periodo,
    activeCategoryIds,
    year,
    selectedMonth ?? undefined
  )
  const monthStats = useStats('mes', activeCategoryIds, year, selectedMonth ?? undefined)

  useEffect(() => {
    setSelectedCategoryIds((current) => current.filter((id) => categories.some((category) => category.id === id)))
  }, [categories])

  const dueAlerts = useMemo(() => {
    const now = new Date()
    const isCurrentMonth = selectedMonth === null || (year === now.getFullYear() && selectedMonth === now.getMonth())
    if (!isCurrentMonth) return []

    return [
      ...buildDueAlerts(subscriptionForecast.expenses, subscriptionForecast.getDueDate, 'Subscription'),
      ...buildDueAlerts(fixedCostForecast.expenses, fixedCostForecast.getDueDate, 'Fixed cost'),
    ].sort((a, b) => {
      if (a.dueLabel === 'overdue' && b.dueLabel !== 'overdue') return -1
      if (b.dueLabel === 'overdue' && a.dueLabel !== 'overdue') return 1
      return 0
    })
  }, [fixedCostForecast.expenses, fixedCostForecast.getDueDate, selectedMonth, subscriptionForecast.expenses, subscriptionForecast.getDueDate, year])

  const months = Array.from({ length: 12 }, (_, index) => {
    const name = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(new Date(2024, index, 1))
    return name.charAt(0).toUpperCase() + name.slice(1)
  })

  function handlePeriodChange(nextPeriod: Periodo) {
    setPeriodo(nextPeriod)
    setSelectedMonth(null)
  }

  return (
    <div className="pb-5">
      <div className="px-4 py-4">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <PeriodFilter selected={periodo} onChange={handlePeriodChange} dimmed={selectedMonth !== null} />

            <div className="relative min-w-0">
              <select
                value={selectedMonth ?? ''}
                onChange={(event) => setSelectedMonth(event.target.value === '' ? null : Number(event.target.value))}
                className={`h-11 w-full appearance-none rounded-xl border border-julius-border bg-julius-card px-3 py-2.5 pr-8 text-xs font-medium text-julius-text transition focus:border-julius-accent focus:outline-none ${
                  selectedMonth === null ? 'text-julius-muted' : ''
                }`}
              >
                <option value="">Current</option>
                {months.map((name, index) => (
                  <option key={name} value={index}>
                    {name} {year}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-julius-muted">⌄</span>
            </div>
          </div>
          <CategoryMultiSelect
            categories={categories}
            selectedIds={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
          />
        </div>
      </div>

      <StatsCards
        total={data?.total ?? 0}
        average={data?.average ?? 0}
        isLoading={isLoading}
      />

      <div className="mt-4 space-y-4">
        <SpendingChart data={data?.dayStats ?? []} categories={categories} isLoading={isLoading} />
        <CategoryBreakdown data={data?.dayStats ?? []} categories={categories} isLoading={isLoading} />
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-julius-border" />
            <p className="text-xs font-semibold text-julius-muted">Planning</p>
            <div className="h-px flex-1 bg-julius-border" />
          </div>
        </div>
        <MonthOutlook
          actualSpend={monthStats.data?.total ?? 0}
          pendingPlanned={subscriptionForecast.projection.pending + fixedCostForecast.projection.pending}
          subscriptions={subscriptionForecast.projection}
          fixedCosts={fixedCostForecast.projection}
          dueAlerts={dueAlerts}
          isLoading={monthStats.isLoading || subscriptionForecast.isLoading || fixedCostForecast.isLoading}
        />
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-julius-border" />
            <p className="text-xs font-semibold text-julius-muted">Review</p>
            <div className="h-px flex-1 bg-julius-border" />
          </div>
        </div>
        <MonthlyTrend data={monthlyTrend.data ?? []} isLoading={monthlyTrend.isLoading} year={year} />
      </div>
    </div>
  )
}
