import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DEFAULT_CATEGORIES, getCategoryDisplay } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category, Currency, Periodo, Transacao } from '@/lib/types'

interface ReportData {
  transactions: Transacao[]
  periodo: Periodo
  year: number
  currency: Currency
  total: number
  average: number
  periodLabel?: string
  categories?: Category[]
}

function hexToRgb(hexValue: string): [number, number, number] {
  const hex = hexValue.replace('#', '')
  return [
    parseInt(hex.substring(0, 2), 16),
    parseInt(hex.substring(2, 4), 16),
    parseInt(hex.substring(4, 6), 16),
  ]
}

function getCategoryName(transaction: Transacao): string {
  return getCategoryDisplay(transaction.category, transaction.tag).name
}

export function generateReport(data: ReportData): jsPDF {
  const { transactions, periodo, year, currency, total, average, periodLabel, categories = [] } = data
  const periodLabels: Record<Periodo, string> = {
    hoje: 'Today',
    semana: 'Week',
    mes: 'Month',
    trimestre: 'Quarter',
    total: 'Year',
  }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  const bg: [number, number, number] = [248, 246, 250]
  const card: [number, number, number] = [255, 253, 255]
  const border: [number, number, number] = [222, 216, 226]
  const text: [number, number, number] = [45, 37, 55]
  const muted: [number, number, number] = [111, 101, 124]
  const accent: [number, number, number] = [93, 45, 136]

  doc.setFillColor(...bg)
  doc.rect(0, 0, pageWidth, 297, 'F')

  let y = 20
  doc.setTextColor(...accent)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('JULIUS', margin, y)

  doc.setFontSize(10)
  doc.setTextColor(...muted)
  doc.setFont('helvetica', 'normal')
  doc.text('Financial statement', margin, y + 7)
  doc.text(
    `${periodLabel ?? periodLabels[periodo]}${!periodLabel && periodo === 'total' ? ` ${year}` : ''} · Generated on ${new Date().toLocaleDateString('en-GB')}`,
    margin,
    y + 13
  )

  y = 50
  const cardWidth = (contentWidth - 8) / 3
  const cards = [
    { label: 'Total', value: formatCurrency(total, currency) },
    { label: 'Daily average', value: formatCurrency(average, currency) },
    { label: 'Transactions', value: String(transactions.length) },
  ]

  cards.forEach((item, index) => {
    const x = margin + index * (cardWidth + 4)
    doc.setFillColor(...card)
    doc.setDrawColor(...border)
    doc.roundedRect(x, y, cardWidth, 20, 2, 2, 'FD')
    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(item.label, x + 4, y + 6)
    doc.setFontSize(11)
    doc.setTextColor(...text)
    doc.setFont('helvetica', 'bold')
    doc.text(item.value, x + 4, y + 14)
    doc.setFont('helvetica', 'normal')
  })

  y = 80
  doc.setFontSize(10)
  doc.setTextColor(...text)
  doc.setFont('helvetica', 'bold')
  doc.text('By category', margin, y)
  y += 6

  const byCategory = new Map<string, { label: string; amount: number; color: string }>()
  for (const transaction of transactions) {
    const display = getCategoryDisplay(transaction.category, transaction.tag)
    const key = transaction.category_id ?? display.id
    const existing = byCategory.get(key) ?? { label: display.name, amount: 0, color: display.color }
    existing.amount += Number(transaction.valor)
    byCategory.set(key, existing)
  }

  for (const category of categories) {
    if (!byCategory.has(category.id)) {
      byCategory.set(category.id, { label: category.name, amount: 0, color: category.color })
    }
  }

  for (const defaultCategory of DEFAULT_CATEGORIES) {
    if (!byCategory.has(defaultCategory.value)) {
      byCategory.set(defaultCategory.value, {
        label: defaultCategory.name,
        amount: 0,
        color: defaultCategory.color,
      })
    }
  }

  const categoryRows = Array.from(byCategory.values())
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  const labelWidth = 34
  const valueWidth = 38
  const barX = margin + labelWidth + 3
  const maxBar = contentWidth - labelWidth - valueWidth - 6

  for (const entry of categoryRows) {
    const pct = total > 0 ? entry.amount / total : 0
    const barWidth = Math.max(pct * maxBar, 1)
    const rgb = hexToRgb(entry.color)

    doc.setFontSize(8)
    doc.setTextColor(...muted)
    doc.text(entry.label.slice(0, 24), margin, y + 3.5)

    doc.setFillColor(...rgb)
    doc.roundedRect(barX, y, barWidth, 4, 1, 1, 'F')

    doc.setTextColor(...muted)
    doc.text(
      `${formatCurrency(entry.amount, currency)} (${Math.round(pct * 100)}%)`,
      pageWidth - margin,
      y + 3.5,
      { align: 'right' }
    )
    y += 10
  }

  y += 5
  autoTable(doc, {
    startY: y,
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: transactions.map((transaction) => {
      const [yr, mo, day] = transaction.dia.split('-')
      return [
        `${day}/${mo}/${yr}`,
        transaction.descricao,
        getCategoryName(transaction),
        formatCurrency(Number(transaction.valor), currency),
      ]
    }),
    styles: {
      fillColor: card,
      textColor: text,
      fontSize: 8,
      cellPadding: 3,
      lineColor: border,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: accent,
      textColor: [255, 253, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 242, 247],
    },
    columnStyles: {
      0: { cellWidth: 24 },
      3: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: margin, right: margin },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    doc.setFillColor(...bg)
    doc.rect(0, 285, pageWidth, 12, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...muted)
    doc.text(`Generated by Julius · ${new Date().toLocaleDateString('en-GB')}`, margin, 291)
    doc.text(`${page}/${pageCount}`, pageWidth - margin, 291, { align: 'right' })
  }

  return doc
}
