import { describe, it, expect } from 'vitest'
import { formatTime, formatDayMonth } from '@/lib/utils/date'
import {
  getCurrentMonthKeyInTimezone,
  getCurrentMonthStartISO,
  getNextMonthBoundaryISO,
} from '@/lib/utils/timezone'

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

describe('timezone month boundaries', () => {
  it('uses the selected timezone to decide the current month', () => {
    const instant = new Date('2026-06-30T22:30:00.000Z')

    expect(getCurrentMonthKeyInTimezone('Europe/Berlin', instant)).toBe('2026-07')
    expect(getCurrentMonthKeyInTimezone('Europe/Lisbon', instant)).toBe('2026-06')
  })

  it('returns UTC instants for local month boundaries', () => {
    const instant = new Date('2026-06-30T22:30:00.000Z')

    expect(getCurrentMonthStartISO('Europe/Berlin', instant)).toBe('2026-06-30T22:00:00.000Z')
    expect(getNextMonthBoundaryISO('Europe/Berlin', instant)).toBe('2026-07-31T22:00:00.000Z')
  })
})
