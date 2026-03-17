import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getCalendarDays } from '@/lib/utils/period'

// Fixa a data actual em terça-feira, 17 de Março de 2026
const FIXED_DATE = new Date(2026, 2, 17) // mês 0-indexed

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_DATE)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getCalendarDays', () => {
  it('"hoje" retorna sempre 1', () => {
    expect(getCalendarDays('hoje', 2026)).toBe(1)
  })

  it('"semana" retorna dias desde Domingo até hoje (Terça = 3)', () => {
    // Domingo 15 Mar → Terça 17 Mar = 3 dias
    expect(getCalendarDays('semana', 2026)).toBe(3)
  })

  it('"mes" retorna dias desde dia 1 até hoje (dia 17)', () => {
    expect(getCalendarDays('mes', 2026)).toBe(17)
  })

  it('"trimestre" retorna dias desde 1 Jan até hoje (Q1: 76 dias)', () => {
    // Jan: 31 + Fev: 28 + Mar: 17 = 76
    expect(getCalendarDays('trimestre', 2026)).toBe(76)
  })

  it('"total" para o ano corrente retorna dias desde 1 Jan até hoje', () => {
    expect(getCalendarDays('total', 2026)).toBe(76)
  })

  it('"total" para ano passado retorna 365 (2025 não é bissexto)', () => {
    expect(getCalendarDays('total', 2025)).toBe(365)
  })

  it('retorna sempre um número positivo', () => {
    const periodos = ['hoje', 'semana', 'mes', 'trimestre', 'total'] as const
    for (const p of periodos) {
      expect(getCalendarDays(p, 2026)).toBeGreaterThan(0)
    }
  })

  it('"semana" nunca excede 7', () => {
    expect(getCalendarDays('semana', 2026)).toBeLessThanOrEqual(7)
  })

  it('"mes" nunca excede 31', () => {
    expect(getCalendarDays('mes', 2026)).toBeLessThanOrEqual(31)
  })
})
