import type { Currency } from '@/lib/types'

const LOCALE_MAP: Record<Currency, string> = {
  EUR: 'pt-PT',
  BRL: 'pt-BR',
  USD: 'en-US',
}

export function formatCurrency(
  value: number,
  currency: Currency = 'EUR',
  locale?: string
): string {
  const defaultLocale = LOCALE_MAP[currency]
  return new Intl.NumberFormat(locale ?? defaultLocale, {
    style: 'currency',
    currency,
  }).format(value)
}

export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'BRL': return 'R$'
    case 'USD': return '$'
    default: return '€'
  }
}
