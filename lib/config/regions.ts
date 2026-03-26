export type RegionCode = 'BR' | 'PT' | 'EU' | 'US'
export type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'en-GB'

export interface RegionConfig {
  code: RegionCode
  flag: string
  name: string
  nameEnglish: string
  currency: 'EUR' | 'BRL' | 'USD'
  currencySymbol: string
  currencyName: string
  locale: Locale
  dateLocale: string
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  BR: { code: 'BR', flag: '🇧🇷', name: 'Brasil', nameEnglish: 'Brazil', currency: 'BRL', currencySymbol: 'R$', currencyName: 'Real (R$)', locale: 'pt-BR', dateLocale: 'pt-BR' },
  PT: { code: 'PT', flag: '🇵🇹', name: 'Portugal', nameEnglish: 'Portugal', currency: 'EUR', currencySymbol: '€', currencyName: 'Euro (€)', locale: 'pt-PT', dateLocale: 'pt-PT' },
  EU: { code: 'EU', flag: '🇪🇺', name: 'Europe', nameEnglish: 'Europe', currency: 'EUR', currencySymbol: '€', currencyName: 'Euro (€)', locale: 'en-GB', dateLocale: 'en-GB' },
  US: { code: 'US', flag: '🇺🇸', name: 'United States', nameEnglish: 'United States', currency: 'USD', currencySymbol: '$', currencyName: 'Dollar ($)', locale: 'en-US', dateLocale: 'en-US' },
}

export const DEFAULT_REGION: RegionCode = 'PT'

export function getRegionConfig(code: RegionCode): RegionConfig {
  return REGIONS[code]
}

export function currencyForRegion(code: RegionCode): 'EUR' | 'BRL' | 'USD' {
  return REGIONS[code].currency
}

export function localeForRegion(code: RegionCode): Locale {
  return REGIONS[code].locale
}
