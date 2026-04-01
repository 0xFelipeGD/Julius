'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Transacao, Periodo, Tag } from '@/lib/types'

function getPeriodRange(periodo: Periodo, year: number): { from: string; to: string } {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  switch (periodo) {
    case 'hoje':
      return { from: todayStr, to: todayStr }
    case 'semana': {
      const from = new Date(now)
      from.setDate(from.getDate() - from.getDay()) // Sunday
      const to = new Date(from)
      to.setDate(to.getDate() + 6) // Saturday
      const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return { from: fmt(from), to: fmt(to) }
    }
    case 'mes': {
      const month = now.getMonth()
      const from = new Date(year, month, 1)
      const to = new Date(year, month + 1, 0)
      return {
        from: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        to: `${year}-${String(month + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`,
      }
    }
    case 'ultimo_mes': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return { from: fmt(from), to: fmt(to) }
    }
    case 'trimestre': {
      const q = Math.floor(now.getMonth() / 3) * 3
      const from = new Date(year, q, 1)
      const to = new Date(year, q + 3, 0)
      const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      return { from: fmtDate(from), to: fmtDate(to) }
    }
    case 'total':
      return { from: `${year}-01-01`, to: `${year}-12-31` }
  }
}

export function useTransactions(periodo: Periodo, tag?: Tag, year?: number) {
  const supabase = createClient()
  const effectiveYear = year ?? new Date().getFullYear()

  return useQuery<Transacao[]>({
    queryKey: ['transactions', periodo, tag, effectiveYear],
    queryFn: async () => {
      const { from, to } = getPeriodRange(periodo, effectiveYear)
      let query = supabase
        .from('transacoes')
        .select('*')
        .gte('dia', from)
        .lte('dia', to)
        .order('dia', { ascending: false })
        .order('hora', { ascending: false })

      if (tag) query = query.eq('tag', tag)

      const { data, error } = await query
      if (error) throw error
      return data as Transacao[]
    },
  })
}

export function useDeleteTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transacoes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateTransaction() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<Transacao, 'valor' | 'tag' | 'descricao' | 'dia'>>
    }) => {
      const { error } = await supabase.from('transacoes').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
