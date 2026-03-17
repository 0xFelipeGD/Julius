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
}[] = [
  { value: 'Alimentacao', label: 'Alimentação', color: '#16A34A', emoji: '🍽️', bgClass: 'bg-green-600', bgMutedClass: 'bg-green-600/20', textClass: 'text-green-500' },
  { value: 'Transporte',  label: 'Transporte',  color: '#2563EB', emoji: '🚗', bgClass: 'bg-blue-600',  bgMutedClass: 'bg-blue-600/20',  textClass: 'text-blue-500' },
  { value: 'Saude',       label: 'Saúde',        color: '#DC2626', emoji: '🏥', bgClass: 'bg-red-600',   bgMutedClass: 'bg-red-600/20',   textClass: 'text-red-500' },
  { value: 'Lazer',       label: 'Lazer',        color: '#9333EA', emoji: '🎮', bgClass: 'bg-purple-600', bgMutedClass: 'bg-purple-600/20', textClass: 'text-purple-500' },
  { value: 'Habitacao',   label: 'Habitação',    color: '#CA8A04', emoji: '🏠', bgClass: 'bg-yellow-600', bgMutedClass: 'bg-yellow-600/20', textClass: 'text-yellow-500' },
  { value: 'Outros',      label: 'Outros',       color: '#64748B', emoji: '📦', bgClass: 'bg-slate-500', bgMutedClass: 'bg-slate-600/20', textClass: 'text-slate-400' },
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
