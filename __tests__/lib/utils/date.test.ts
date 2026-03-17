import { describe, it, expect } from 'vitest'
import { formatTime, formatDayMonth } from '@/lib/utils/date'

describe('formatTime', () => {
  it('retorna HH:MM de uma string HH:MM:SS', () => {
    expect(formatTime('14:35:00')).toBe('14:35')
  })

  it('retorna HH:MM quando já é HH:MM', () => {
    expect(formatTime('09:05')).toBe('09:05')
  })

  it('preserva zeros à esquerda', () => {
    expect(formatTime('08:03:22')).toBe('08:03')
  })
})

describe('formatDayMonth', () => {
  it('formata data YYYY-MM-DD para DD/MM', () => {
    expect(formatDayMonth('2026-03-17')).toBe('17/03')
  })

  it('formata dia 1 com zero à esquerda', () => {
    expect(formatDayMonth('2026-01-01')).toBe('01/01')
  })

  it('formata Dezembro correctamente', () => {
    expect(formatDayMonth('2026-12-31')).toBe('31/12')
  })
})
