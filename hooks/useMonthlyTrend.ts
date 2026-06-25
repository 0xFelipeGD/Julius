'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface MonthlyTrendPoint {
  month: string
  total: number
}

export function useMonthlyTrend(year: number, categoryId?: string) {
  const supabase = createClient()

  return useQuery<MonthlyTrendPoint[]>({
    queryKey: ['monthly-trend', year, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('transacoes')
        .select('valor, dia, category_id')
        .gte('dia', `${year}-01-01`)
        .lte('dia', `${year}-12-31`)

      if (categoryId) query = query.eq('category_id', categoryId)

      const { data, error } = await query
      if (error) throw error

      const totals = Array.from({ length: 12 }, () => 0)
      for (const transaction of data ?? []) {
        const monthIndex = Number(String(transaction.dia).slice(5, 7)) - 1
        if (monthIndex >= 0 && monthIndex < 12) {
          totals[monthIndex] += Number(transaction.valor)
        }
      }

      return totals.map((total, index) => ({
        month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(year, index, 1)),
        total,
      }))
    },
  })
}
