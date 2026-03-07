'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ALL_TAGS } from '@/lib/categories'
import type { Periodo, Tag, DayStats } from '@/lib/types'

function getPeriodRange(periodo: Periodo, year: number): { from: string; to: string } {
  const now = new Date()

  switch (periodo) {
    case 'hoje': {
      const s = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      return { from: s, to: s }
    }
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
      const to = new Date(year, month + 1, 0)
      return {
        from: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        to: `${year}-${String(month + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`,
      }
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

export function useStats(periodo: Periodo, tag?: Tag, year?: number) {
  const supabase = createClient()
  const effectiveYear = year ?? new Date().getFullYear()

  return useQuery<{ dayStats: DayStats[]; total: number; average: number }>({
    queryKey: ['stats', periodo, tag, effectiveYear],
    queryFn: async () => {
      const { from, to } = getPeriodRange(periodo, effectiveYear)
      let query = supabase
        .from('transacoes')
        .select('*')
        .gte('dia', from)
        .lte('dia', to)
        .order('dia', { ascending: true })

      if (tag) query = query.eq('tag', tag)

      const { data, error } = await query
      if (error) throw error

      const transactions = data ?? []

      const grouped = new Map<string, Map<Tag, number>>()
      for (const t of transactions) {
        if (!grouped.has(t.dia)) grouped.set(t.dia, new Map())
        const dayMap = grouped.get(t.dia)!
        dayMap.set(t.tag as Tag, (dayMap.get(t.tag as Tag) ?? 0) + Number(t.valor))
      }

      const dayStats: DayStats[] = Array.from(grouped.entries()).map(([dia, catMap]) => {
        const por_categoria = {} as Record<Tag, number>
        for (const cat of ALL_TAGS) por_categoria[cat] = catMap.get(cat) ?? 0
        const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0)
        return { dia, total, por_categoria }
      })

      const total = dayStats.reduce((sum, d) => sum + d.total, 0)
      const average = total / (dayStats.length || 1)

      return { dayStats, total, average }
    },
  })
}
