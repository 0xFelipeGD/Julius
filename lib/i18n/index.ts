'use client'

import type { Translations } from './types'
import { enGB } from './locales/en-GB'

const LOCALE_MAP: Record<string, Translations> = {
  'en-GB': enGB,
}

export function useTranslation(): Translations {
  return enGB
}

export function getTranslations(locale: string): Translations {
  return LOCALE_MAP[locale] ?? enGB
}

export type { Translations }
