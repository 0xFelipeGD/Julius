'use client'

import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { localeForRegion } from '@/lib/config/regions'
import type { Translations } from './types'
import { ptPT } from './locales/pt-PT'
import { ptBR } from './locales/pt-BR'
import { enGB } from './locales/en-GB'
import { enUS } from './locales/en-US'

const LOCALE_MAP: Record<string, Translations> = {
  'pt-PT': ptPT,
  'pt-BR': ptBR,
  'en-GB': enGB,
  'en-US': enUS,
}

export function useTranslation(): Translations {
  const region = useUserSettingsStore((s) => s.region)
  if (!region) return enUS

  const locale = localeForRegion(region)
  return LOCALE_MAP[locale] ?? ptPT
}

export function getTranslations(locale: string): Translations {
  return LOCALE_MAP[locale] ?? ptPT
}

export type { Translations }
