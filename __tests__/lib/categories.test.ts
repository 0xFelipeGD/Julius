import { describe, it, expect } from 'vitest'
import {
  CATEGORIES,
  ALL_TAGS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  CATEGORY_BG,
  CATEGORY_BG_MUTED,
  CATEGORY_TEXT,
} from '@/lib/categories'

describe('CATEGORIES', () => {
  it('tem 7 categorias', () => {
    expect(CATEGORIES).toHaveLength(7)
  })

  it('cada categoria tem todos os campos obrigatórios', () => {
    for (const cat of CATEGORIES) {
      expect(cat.value).toBeTruthy()
      expect(cat.label).toBeTruthy()
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(cat.emoji).toBeTruthy()
      expect(cat.bgClass).toMatch(/^bg-/)
      expect(cat.bgMutedClass).toContain('/')
      expect(cat.textClass).toMatch(/^text-/)
    }
  })

  it('inclui as categorias esperadas', () => {
    const values = CATEGORIES.map((c) => c.value)
    expect(values).toContain('Alimentacao')
    expect(values).toContain('Transporte')
    expect(values).toContain('Saude')
    expect(values).toContain('Lazer')
    expect(values).toContain('Habitacao')
    expect(values).toContain('Outros')
    expect(values).toContain('Impostos')
  })
})

describe('ALL_TAGS', () => {
  it('tem o mesmo comprimento que CATEGORIES', () => {
    expect(ALL_TAGS).toHaveLength(CATEGORIES.length)
  })

  it('não tem duplicados', () => {
    expect(new Set(ALL_TAGS).size).toBe(ALL_TAGS.length)
  })
})

describe('helpers derivados', () => {
  it('CATEGORY_LABELS mapeia todas as tags', () => {
    for (const tag of ALL_TAGS) {
      expect(CATEGORY_LABELS[tag]).toBeTruthy()
    }
  })

  it('CATEGORY_COLORS mapeia todas as tags para hex', () => {
    for (const tag of ALL_TAGS) {
      expect(CATEGORY_COLORS[tag]).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('CATEGORY_EMOJIS mapeia todas as tags', () => {
    for (const tag of ALL_TAGS) {
      expect(CATEGORY_EMOJIS[tag]).toBeTruthy()
    }
  })

  it('CATEGORY_BG mapeia para classes Tailwind bg-', () => {
    for (const tag of ALL_TAGS) {
      expect(CATEGORY_BG[tag]).toMatch(/^bg-/)
    }
  })

  it('CATEGORY_BG_MUTED mapeia para classes com opacidade', () => {
    for (const tag of ALL_TAGS) {
      expect(CATEGORY_BG_MUTED[tag]).toContain('/')
    }
  })

  it('CATEGORY_TEXT mapeia para classes text-', () => {
    for (const tag of ALL_TAGS) {
      expect(CATEGORY_TEXT[tag]).toMatch(/^text-/)
    }
  })
})
