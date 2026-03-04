'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ALL_TAGS } from '@/lib/categories'
import type { Periodo, Tag, DayStats } from '@/lib/types'

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

export function useStats(periodo: Periodo, tag?: Tag) {
  const supabase = createClient()

  return useQuery<{ dayStats: DayStats[]; total: number; average: number }>({
    queryKey: ['stats', periodo, tag],
    queryFn: async () => {
      const { from, to } = getPeriodRange(periodo)
      let query = supabase
        .from('transacoes')
        .select('*')
        .gte('dia', from)
        .lte('dia', to)
        .order('dia', { ascending: true })

      if (tag) {
        query = query.eq('tag', tag)
      }

      const { data, error } = await query
      if (error) throw error

      const transactions = data ?? []

      // Group by day
      const grouped = new Map<string, Map<Tag, number>>()
      for (const t of transactions) {
        if (!grouped.has(t.dia)) {
          grouped.set(t.dia, new Map())
        }
        const dayMap = grouped.get(t.dia)!
        dayMap.set(t.tag as Tag, (dayMap.get(t.tag as Tag) ?? 0) + Number(t.valor))
      }

      const dayStats: DayStats[] = Array.from(grouped.entries()).map(([dia, catMap]) => {
        const por_categoria = {} as Record<Tag, number>
        for (const cat of ALL_TAGS) {
          por_categoria[cat] = catMap.get(cat) ?? 0
        }
        const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0)
        return { dia, total, por_categoria }
      })

      const total = dayStats.reduce((sum, d) => sum + d.total, 0)
      const days = dayStats.length || 1
      const average = total / days

      return { dayStats, total, average }
    },
  })
}
