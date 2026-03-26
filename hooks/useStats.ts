'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { ALL_TAGS } from '@/lib/categories'
import type { Periodo, Tag, DayStats } from '@/lib/types'

function getCalendarDays(periodo: Periodo, year: number): number {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (periodo) {
    case 'hoje':
      return 1

    case 'semana': {
      const sunday = new Date(today)
      sunday.setDate(sunday.getDate() - sunday.getDay())
      const saturday = new Date(sunday)
      saturday.setDate(saturday.getDate() + 6)
      const end = today < saturday ? today : saturday
      return Math.floor((end.getTime() - sunday.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }

    case 'mes': {
      const firstDay = new Date(year, now.getMonth(), 1)
      const lastDay = new Date(year, now.getMonth() + 1, 0)
      const end = today < lastDay ? today : lastDay
      return Math.floor((end.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }

    case 'trimestre': {
      const q = Math.floor(now.getMonth() / 3) * 3
      const firstDay = new Date(year, q, 1)
      const lastDay = new Date(year, q + 3, 0)
      const end = today < lastDay ? today : lastDay
      return Math.floor((end.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }

    case 'total': {
      const firstDay = new Date(year, 0, 1)
      const lastDay = new Date(year, 11, 31)
      const end = today < lastDay ? today : lastDay
      return Math.floor((end.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1
    }
  }
}

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

function fillMissingDays(stats: DayStats[], from: string, to: string): DayStats[] {
  const filled: DayStats[] = []
  const existing = new Map(stats.map(s => [s.dia, s]))
  const current = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')

  // Cap end to today to avoid future empty days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cappedEnd = end < today ? end : today

  while (current <= cappedEnd) {
    const iso = current.toISOString().split('T')[0]
    filled.push(existing.get(iso) ?? {
      dia: iso,
      total: 0,
      por_categoria: Object.fromEntries(ALL_TAGS.map(t => [t, 0])) as Record<Tag, number>,
    })
    current.setDate(current.getDate() + 1)
  }
  return filled
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

      // Fill missing days with zero-spend entries
      const filledDayStats = fillMissingDays(dayStats, from, to)

      const total = filledDayStats.reduce((sum, d) => sum + d.total, 0)
      const calendarDays = getCalendarDays(periodo, effectiveYear)
      const average = total / calendarDays

      return { dayStats: filledDayStats, total, average }
    },
  })
}
