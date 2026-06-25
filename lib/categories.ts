import type { Category, LegacyTag } from '@/lib/types'

export interface DefaultCategory {
  value: LegacyTag
  name: string
  color: string
  icon: string
  sort_order: number
  is_fallback?: boolean
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { value: 'Alimentacao', name: 'Food', color: '#2F9E6D', icon: 'utensils', sort_order: 10 },
  { value: 'Transporte', name: 'Transport', color: '#3B76D1', icon: 'car', sort_order: 20 },
  { value: 'Saude', name: 'Health', color: '#D95B59', icon: 'heart-pulse', sort_order: 30 },
  { value: 'Lazer', name: 'Leisure', color: '#7551C8', icon: 'sparkles', sort_order: 40 },
  { value: 'Habitacao', name: 'Housing', color: '#B8872D', icon: 'home', sort_order: 50 },
  { value: 'Impostos', name: 'Taxes', color: '#218DA3', icon: 'landmark', sort_order: 60 },
  { value: 'Outros', name: 'Other', color: '#7C8191', icon: 'archive', sort_order: 70, is_fallback: true },
]

export const CATEGORIES = DEFAULT_CATEGORIES.map((category) => ({
  value: category.value,
  label: category.name,
  color: category.color,
  emoji: iconToEmoji(category.icon),
  bgClass: 'bg-category-soft',
  bgMutedClass: 'bg-category-soft/70',
  textClass: 'text-category',
  labels: { 'en-GB': category.name },
}))

export const ALL_TAGS: LegacyTag[] = DEFAULT_CATEGORIES.map((category) => category.value)

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.value, category.color])
)

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.value, category.name])
)

export const CATEGORY_EMOJIS: Record<LegacyTag, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.value, iconToEmoji(category.icon)])
) as Record<LegacyTag, string>

export const CATEGORY_BG: Record<LegacyTag, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.value, 'bg-category-soft'])
) as Record<LegacyTag, string>

export const CATEGORY_BG_MUTED: Record<LegacyTag, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.value, 'bg-category-soft/70'])
) as Record<LegacyTag, string>

export const CATEGORY_TEXT: Record<LegacyTag, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((category) => [category.value, 'text-category'])
) as Record<LegacyTag, string>

export function normalizeCategoryName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getDefaultCategory(tag: LegacyTag | string | null | undefined): DefaultCategory {
  return DEFAULT_CATEGORIES.find((category) => category.value === tag) ?? getFallbackDefaultCategory()
}

export function getFallbackDefaultCategory(): DefaultCategory {
  return DEFAULT_CATEGORIES.find((category) => category.is_fallback) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1]
}

export function getCategoryLabel(tag: LegacyTag | string | null | undefined): string {
  return getDefaultCategory(tag).name
}

export function toCategorySeed(userId: string, category: DefaultCategory) {
  return {
    user_id: userId,
    name: category.name,
    normalized_name: normalizeCategoryName(category.name),
    color: category.color,
    icon: category.icon,
    sort_order: category.sort_order,
    legacy_tag: category.value,
    is_fallback: Boolean(category.is_fallback),
  }
}

export function getCategoryDisplay(category?: Category | null, legacyTag?: LegacyTag | string | null) {
  if (category) {
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      isFallback: category.is_fallback,
    }
  }

  const fallback = getDefaultCategory(legacyTag)
  return {
    id: fallback.value,
    name: fallback.name,
    color: fallback.color,
    icon: fallback.icon,
    isFallback: Boolean(fallback.is_fallback),
  }
}

export function iconToEmoji(icon: string): string {
  switch (icon) {
    case 'utensils':
      return '🍽'
    case 'car':
      return '🚗'
    case 'heart-pulse':
      return '♡'
    case 'sparkles':
      return '✦'
    case 'home':
      return '⌂'
    case 'landmark':
      return '€'
    default:
      return '•'
  }
}
