import type { Currency } from '@/lib/types'

export function formatCurrency(value: number, currency: Currency = 'EUR'): string {
  return new Intl.NumberFormat(currency === 'EUR' ? 'pt-PT' : 'pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}
