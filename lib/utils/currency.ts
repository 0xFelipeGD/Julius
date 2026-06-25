import type { Currency } from '@/lib/types'

export const DEFAULT_CURRENCY: Currency = 'EUR'
export const DEFAULT_LOCALE = 'en-GB'

export function formatCurrency(
  value: number,
  currency: Currency = DEFAULT_CURRENCY,
  locale?: string
): string {
  return new Intl.NumberFormat(locale ?? DEFAULT_LOCALE, {
    style: 'currency',
    currency,
  }).format(value)
}

export function getCurrencySymbol(_currency: Currency = DEFAULT_CURRENCY): string {
  return '€'
}
