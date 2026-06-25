'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { clampDayToMonth, formatISODateInTimezone, getCurrentDateInTimezone } from '@/lib/utils/timezone'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import type { Category, RecurringExpense, RecurringExpenseType, RecurringPayment } from '@/lib/types'

export interface SubscriptionInput {
  description: string
  amount: number
  category_id: string
  payment_day: number
  billing_interval_months: number
  billing_anchor_month: string
  notes?: string | null
}

export interface SubscriptionProjection {
  total: number
  paid: number
  pending: number
  byCategory: Array<{
    category: Category | null
    amount: number
    paid: number
    pending: number
  }>
}

export function getMonthStart(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`
}

export function getCurrentMonthInTimezone(timezone: string): { year: number; monthIndex: number; monthStart: string } {
  const current = getCurrentDateInTimezone(timezone)
  return {
    year: current.getFullYear(),
    monthIndex: current.getMonth(),
    monthStart: getMonthStart(current.getFullYear(), current.getMonth()),
  }
}

function buildProjection(expenses: RecurringExpense[]): SubscriptionProjection {
  const byCategory = new Map<string, { category: Category | null; amount: number; paid: number; pending: number }>()
  let total = 0
  let paid = 0

  for (const expense of expenses) {
    if (!expense.current_payment) continue

    const amount = Number(expense.amount)
    const isPaid = expense.current_payment?.status === 'paid'
    const isSkipped = expense.current_payment?.status === 'skipped'
    total += amount
    if (isPaid) paid += amount

    const key = expense.category_id
    const existing = byCategory.get(key) ?? {
      category: expense.category ?? null,
      amount: 0,
      paid: 0,
      pending: 0,
    }

    existing.amount += amount
    if (isPaid) existing.paid += amount
    else if (!isSkipped) existing.pending += amount
    byCategory.set(key, existing)
  }

  return {
    total,
    paid,
    pending: expenses.reduce((sum, expense) => {
      if (!expense.current_payment || expense.current_payment.status !== 'pending') return sum
      return sum + Number(expense.amount)
    }, 0),
    byCategory: Array.from(byCategory.values()).sort((a, b) => b.amount - a.amount),
  }
}

export function useSubscriptions(expenseType: RecurringExpenseType = 'subscription', monthStart?: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const timezone = useUserSettingsStore((state) => state.timezone)
  const effectiveMonth = monthStart ?? getCurrentMonthInTimezone(timezone).monthStart

  const query = useQuery<{ expenses: RecurringExpense[]; projection: SubscriptionProjection }>({
    queryKey: ['recurring-expenses', expenseType, effectiveMonth],
    queryFn: async () => {
      await supabase.rpc('ensure_recurring_payments', { target_month: effectiveMonth })

      const { data, error } = await supabase
        .from('recurring_expenses')
        .select(`
          *,
          category:user_categories(*),
          payments:recurring_payments(*)
        `)
        .is('deleted_at', null)
        .eq('expense_type', expenseType)
        .order('payment_day', { ascending: true })
        .order('description', { ascending: true })

      if (error) throw error

      const expenses = ((data ?? []) as Array<RecurringExpense & { payments?: RecurringPayment[] }>).map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
        current_payment: expense.payments?.find((payment) => payment.month === effectiveMonth) ?? null,
        billing_interval_months: Number(expense.billing_interval_months ?? 1),
      }))

      return {
        expenses,
        projection: buildProjection(expenses),
      }
    },
  })

  const createSubscription = useMutation({
    mutationFn: async (input: SubscriptionInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expired.')

      const { error } = await supabase.from('recurring_expenses').insert({
        user_id: user.id,
        category_id: input.category_id,
        description: input.description.trim(),
        amount: input.amount,
        expense_type: expenseType,
        payment_day: input.payment_day,
        billing_interval_months: input.billing_interval_months,
        billing_anchor_month: input.billing_anchor_month,
        notes: input.notes?.trim() || null,
        is_active: true,
      })

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] }),
  })

  const updateSubscription = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SubscriptionInput }) => {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({
          category_id: input.category_id,
          description: input.description.trim(),
          amount: input.amount,
          payment_day: input.payment_day,
          billing_interval_months: input.billing_interval_months,
          billing_anchor_month: input.billing_anchor_month,
          notes: input.notes?.trim() || null,
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] }),
  })

  const deleteSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] }),
  })

  const markPaid = useMutation({
    mutationFn: async (paymentId: string) => {
      const now = getCurrentDateInTimezone(timezone)
      const paidDate = formatISODateInTimezone(new Date(), timezone)
      const paidTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const { error } = await supabase.rpc('confirm_recurring_payment', {
        payment_id: paymentId,
        paid_date: paidDate,
        paid_time: paidTime,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const unmarkPaid = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.rpc('unmark_recurring_payment', { payment_id: paymentId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const skipPayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.rpc('skip_recurring_payment', { payment_id: paymentId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-expenses'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  return {
    ...query,
    expenses: query.data?.expenses ?? [],
    projection: query.data?.projection ?? { total: 0, paid: 0, pending: 0, byCategory: [] },
    createSubscription,
    updateSubscription,
    deleteSubscription,
    markPaid,
    unmarkPaid,
    skipPayment,
    getDueDate: (paymentDay: number) => {
      const [year, month] = effectiveMonth.split('-').map(Number)
      return clampDayToMonth(year, month - 1, paymentDay)
    },
  }
}
