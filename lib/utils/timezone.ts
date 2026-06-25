export const DEFAULT_TIMEZONE = 'Europe/Lisbon'

export function getBrowserTimezone(): string {
  if (typeof Intl === 'undefined') return DEFAULT_TIMEZONE

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE
}

export function isValidTimezone(timezone: string | null | undefined): timezone is string {
  if (!timezone) return false

  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).format(new Date())
    return true
  } catch {
    return false
  }
}

export function getCurrentDateInTimezone(timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return new Date(
    Number(get('year')),
    Number(get('month')) - 1,
    Number(get('day')),
    Number(get('hour')),
    Number(get('minute')),
    Number(get('second'))
  )
}

export function formatISODateInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '01'
  return `${get('year')}-${get('month')}-${get('day')}`
}

function getDatePartsInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
  }
}

function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const parts = getDatePartsInTimezone(date, timezone)
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  return asUtc - date.getTime()
}

function zonedDateTimeToUtcISO(
  timezone: string,
  year: number,
  monthIndex: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): string {
  const guessedUtc = new Date(Date.UTC(year, monthIndex, day, hour, minute, second))
  const offset = getTimezoneOffsetMs(guessedUtc, timezone)
  return new Date(guessedUtc.getTime() - offset).toISOString()
}

export function getCurrentMonthKeyInTimezone(timezone: string, from = new Date()): string {
  const current = getDatePartsInTimezone(from, timezone)
  return `${current.year}-${String(current.month).padStart(2, '0')}`
}

export function getCurrentMonthStartISO(timezone: string, from = new Date()): string {
  const current = getDatePartsInTimezone(from, timezone)
  return zonedDateTimeToUtcISO(timezone, current.year, current.month - 1, 1)
}

export function getNextMonthBoundaryISO(timezone: string, from = new Date()): string {
  const current = getDatePartsInTimezone(from, timezone)
  return zonedDateTimeToUtcISO(timezone, current.year, current.month, 1)
}

export function clampDayToMonth(year: number, monthIndex: number, day: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  return new Date(year, monthIndex, Math.min(Math.max(day, 1), lastDay))
}
