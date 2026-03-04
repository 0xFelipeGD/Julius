'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Transacao, Periodo, Tag } from '@/lib/types'

function getPeriodRange(periodo: Periodo): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().split('T')[0]
  let from: Date

  switch (periodo) {
    case 'semana':
      from = new Date(now)
      from.setDate(from.getDate() - 7)
      break
    case 'quinzena':
      from = new Date(now)
      from.setDate(from.getDate() - 15)
      break
    case 'mes':
      from = new Date(now)
      from.setMonth(from.getMonth() - 1)
      break
    case 'total':
      from = new Date('2020-01-01')
      break
  }

  return { from: from.toISOString().split('T')[0], to }
}

export function useTransactions(periodo: Periodo, tag?: Tag) {
  const supabase = createClient()

  return useQuery<Transacao[]>({
    queryKey: ['transactions', periodo, tag],
    queryFn: async () => {
      const { from, to } = getPeriodRange(periodo)
      let query = supabase
        .from('transacoes')
        .select('*')
        .gte('dia', from)
        .lte('dia', to)
        .order('dia', { ascending: false })
        .order('hora', { ascending: false })

      if (tag) {
        query = query.eq('tag', tag)
      }

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
