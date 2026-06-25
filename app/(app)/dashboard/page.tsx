'use client'

import { useMemo, useState } from 'react'
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
import type { Periodo, RecurringExpense } from '@/lib/types'
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

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const year = useAppStore((state) => state.selectedYear)
  const { categories } = useCategories()
  const forecastMonth = selectedMonth !== null ? getMonthStart(year, selectedMonth) : undefined
  const subscriptionForecast = useSubscriptions('subscription', forecastMonth)
  const fixedCostForecast = useSubscriptions('fixed_cost', forecastMonth)
  const monthlyTrend = useMonthlyTrend(year, categoryId === 'all' ? undefined : categoryId)

  const { data, isLoading } = useStats(
    periodo,
    categoryId === 'all' ? undefined : categoryId,
    year,
    selectedMonth ?? undefined
  )
  const monthStats = useStats('mes', categoryId === 'all' ? undefined : categoryId, year, selectedMonth ?? undefined)
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
        <div className="grid grid-cols-[1fr_1.05fr_1fr] gap-2">
          <PeriodFilter selected={periodo} onChange={handlePeriodChange} dimmed={selectedMonth !== null} />
          <div className="relative min-w-0">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-julius-border bg-julius-card px-3 py-2.5 pr-8 text-xs font-medium text-julius-text transition focus:border-julius-accent focus:outline-none"
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-julius-muted">⌄</span>
          </div>

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
