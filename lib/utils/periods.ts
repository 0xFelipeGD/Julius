import type { Period, Periodo } from '@/lib/types'

export function toLegacyPeriod(period: Period): Periodo {
  switch (period) {
    case 'today':
      return 'hoje'
    case 'week':
      return 'semana'
    case 'month':
      return 'mes'
    case 'quarter':
      return 'trimestre'
    case 'year':
      return 'total'
  }
}

export function fromLegacyPeriod(period: Periodo): Period {
  switch (period) {
    case 'hoje':
      return 'today'
    case 'semana':
      return 'week'
    case 'mes':
      return 'month'
    case 'trimestre':
      return 'quarter'
    case 'total':
      return 'year'
  }
}
