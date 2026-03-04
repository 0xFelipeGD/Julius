/**
 * FONTE ÚNICA DE CATEGORIAS
 *
 * Para adicionar ou remover categorias, edita APENAS este ficheiro.
 * Todos os outros ficheiros importam daqui automaticamente.
 *
 * Exemplo para adicionar "Vestuario":
 *   { value: 'Vestuario', label: 'Vestuário', color: '#EC4899' }
 *
 * Lembra-te também de:
 *   1. Adicionar o valor ao tipo Tag em lib/types/index.ts
 *   2. Adicionar o valor às TAGS DISPONÍVEIS no prompt do Julius em
 *      supabase/functions/julius-chat/index.ts (linha JULIUS_SYSTEM_PROMPT)
 */

import type { Tag } from '@/lib/types'

export const CATEGORIES: { value: Tag; label: string; color: string }[] = [
  { value: 'Alimentacao', label: 'Alimentação', color: '#16A34A' },
  { value: 'Transporte', label: 'Transporte', color: '#2563EB' },
  { value: 'Saude', label: 'Saúde', color: '#DC2626' },
  { value: 'Lazer', label: 'Lazer', color: '#9333EA' },
  { value: 'Habitacao', label: 'Habitação', color: '#CA8A04' },
  { value: 'Outros', label: 'Outros', color: '#64748B' },
]

export const ALL_TAGS: Tag[] = CATEGORIES.map((c) => c.value)

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.color])
)

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)
