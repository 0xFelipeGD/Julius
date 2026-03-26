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

export const CATEGORIES: {
  value: Tag
  label: string
  color: string
  emoji: string
  bgClass: string
  bgMutedClass: string
  textClass: string
  labels: Record<string, string>
}[] = [
  { value: 'Alimentacao', label: 'Alimentação', color: '#16A34A', emoji: '🍽️', bgClass: 'bg-green-600', bgMutedClass: 'bg-green-600/20', textClass: 'text-green-500', labels: { 'pt-PT': 'Alimentação', 'pt-BR': 'Alimentação', 'en-GB': 'Food', 'en-US': 'Food' } },
  { value: 'Transporte',  label: 'Transporte',  color: '#2563EB', emoji: '🚗', bgClass: 'bg-blue-600',  bgMutedClass: 'bg-blue-600/20',  textClass: 'text-blue-500',  labels: { 'pt-PT': 'Transporte', 'pt-BR': 'Transporte', 'en-GB': 'Transport', 'en-US': 'Transport' } },
  { value: 'Saude',       label: 'Saúde',        color: '#DC2626', emoji: '🏥', bgClass: 'bg-red-600',   bgMutedClass: 'bg-red-600/20',   textClass: 'text-red-500',   labels: { 'pt-PT': 'Saúde', 'pt-BR': 'Saúde', 'en-GB': 'Health', 'en-US': 'Health' } },
  { value: 'Lazer',       label: 'Lazer',        color: '#9333EA', emoji: '🎮', bgClass: 'bg-purple-600', bgMutedClass: 'bg-purple-600/20', textClass: 'text-purple-500', labels: { 'pt-PT': 'Lazer', 'pt-BR': 'Lazer', 'en-GB': 'Leisure', 'en-US': 'Leisure' } },
  { value: 'Habitacao',   label: 'Habitação',    color: '#CA8A04', emoji: '🏠', bgClass: 'bg-yellow-600', bgMutedClass: 'bg-yellow-600/20', textClass: 'text-yellow-500', labels: { 'pt-PT': 'Habitação', 'pt-BR': 'Habitação', 'en-GB': 'Housing', 'en-US': 'Housing' } },
  { value: 'Impostos',    label: 'Impostos',     color: '#0891B2', emoji: '🏛️', bgClass: 'bg-cyan-600',  bgMutedClass: 'bg-cyan-600/20',  textClass: 'text-cyan-500',  labels: { 'pt-PT': 'Impostos', 'pt-BR': 'Impostos', 'en-GB': 'Taxes', 'en-US': 'Taxes' } },
  { value: 'Outros',      label: 'Outros',       color: '#64748B', emoji: '📦', bgClass: 'bg-slate-500', bgMutedClass: 'bg-slate-600/20', textClass: 'text-slate-400', labels: { 'pt-PT': 'Outros', 'pt-BR': 'Outros', 'en-GB': 'Other', 'en-US': 'Other' } },
]

export const ALL_TAGS: Tag[] = CATEGORIES.map((c) => c.value)

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.color])
)

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
)

export const CATEGORY_EMOJIS: Record<Tag, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.emoji])
) as Record<Tag, string>

export const CATEGORY_BG: Record<Tag, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.bgClass])
) as Record<Tag, string>

export const CATEGORY_BG_MUTED: Record<Tag, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.bgMutedClass])
) as Record<Tag, string>

export const CATEGORY_TEXT: Record<Tag, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.textClass])
) as Record<Tag, string>

/**
 * Get localised label for a category
 * @param tag - the category tag value
 * @param locale - BCP 47 locale string (e.g. 'pt-PT', 'en-GB')
 */
export function getCategoryLabel(tag: Tag, locale?: string): string {
  const cat = CATEGORIES.find((c) => c.value === tag)
  if (!cat) return tag
  if (locale && cat.labels[locale]) return cat.labels[locale]
  return cat.label
}
