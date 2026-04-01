import type { Periodo } from '@/lib/types'

export function getCalendarDays(periodo: Periodo, year: number): number {
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

    case 'ultimo_mes': {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      return Math.floor((lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1
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
