function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.getTime() === today.getTime()) return 'Hoje'
  if (date.getTime() === yesterday.getTime()) return 'Ontem'

  return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })
}

export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

export function formatDayMonth(dateStr: string): string {
  const date = parseLocalDate(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}
