import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CATEGORIES, getCategoryLabel } from '@/lib/categories'
import { getCalendarDays } from '@/lib/utils/period'
import type { Transacao, Periodo, Currency, Locale } from '@/lib/types'
import { formatCurrency } from '@/lib/utils/currency'
import type { Translations } from '@/lib/i18n/types'

interface ReportData {
  transactions: Transacao[]
  periodo: Periodo
  year: number
  currency: Currency
  total: number
  average: number
  locale?: Locale
  translations?: Translations
}

export function generateReport(data: ReportData): jsPDF {
  const { transactions, periodo, year, currency, total, average, locale = 'pt-PT', translations } = data
  const tr = translations
  const periodoLabels: Record<Periodo, string> = tr?.pdf.periods ?? {
    hoje: 'Hoje', semana: 'Semana', mes: 'Mês', trimestre: 'Trimestre', total: 'Ano',
  }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PAGE_W = 210
  const MARGIN = 15
  const CONTENT_W = PAGE_W - MARGIN * 2

  // Colors (RGB)
  const BG_DARK: [number, number, number] = [2, 6, 23]       // #020617 slate-950
  const BG_CARD: [number, number, number] = [30, 41, 59]     // #1E293B slate-800
  const TEXT_WHITE: [number, number, number] = [248, 250, 252]
  const TEXT_MUTED: [number, number, number] = [148, 163, 184]
  const ACCENT: [number, number, number] = [37, 99, 235]

  // Background
  doc.setFillColor(...BG_DARK)
  doc.rect(0, 0, PAGE_W, 297, 'F')

  // Header
  let y = 20
  doc.setTextColor(...ACCENT)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('JULIUS', MARGIN, y)

  doc.setFontSize(10)
  doc.setTextColor(...TEXT_MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text(tr?.pdf.subtitle ?? 'Relatório Financeiro', MARGIN, y + 7)
  doc.text(
    `${periodoLabels[periodo]}${periodo === 'total' ? ` ${year}` : ''} · ${tr?.pdf.generatedAt ?? 'Gerado a'} ${new Date().toLocaleDateString(locale)}`,
    MARGIN,
    y + 13
  )

  // Summary cards
  y = 50
  const cardW = (CONTENT_W - 8) / 3
  const cards = [
    { label: tr?.pdf.total ?? 'Total', value: formatCurrency(total, currency, locale) },
    { label: tr?.pdf.dailyAverage ?? 'Média Diária', value: formatCurrency(average, currency, locale) },
    { label: tr?.pdf.transactions ?? 'Transações', value: String(transactions.length) },
  ]

  cards.forEach((card, i) => {
    const x = MARGIN + i * (cardW + 4)
    doc.setFillColor(...BG_CARD)
    doc.roundedRect(x, y, cardW, 20, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(card.label, x + 4, y + 6)
    doc.setFontSize(11)
    doc.setTextColor(...TEXT_WHITE)
    doc.setFont('helvetica', 'bold')
    doc.text(card.value, x + 4, y + 14)
    doc.setFont('helvetica', 'normal')
  })

  // Category breakdown
  y = 80
  doc.setFontSize(10)
  doc.setTextColor(...TEXT_WHITE)
  doc.setFont('helvetica', 'bold')
  doc.text(tr?.pdf.byCategory ?? 'Por Categoria', MARGIN, y)
  y += 5

  // Group transactions by category
  const byCategory = new Map<string, number>()
  for (const t of transactions) {
    byCategory.set(t.tag, (byCategory.get(t.tag) ?? 0) + Number(t.valor))
  }

  const LABEL_W = 28
  const VALUE_W = 38
  const BAR_X = MARGIN + LABEL_W + 3
  const maxBar = CONTENT_W - LABEL_W - VALUE_W - 6

  for (const cat of CATEGORIES) {
    const amount = byCategory.get(cat.value) ?? 0
    if (amount === 0) continue
    const pct = total > 0 ? amount / total : 0
    const barW = Math.max(pct * maxBar, 1)

    // Parse hex color to RGB
    const hex = cat.color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // Label (no emoji — jsPDF doesn't support them)
    doc.setFontSize(8)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(getCategoryLabel(cat.value, locale), MARGIN, y + 3.5)

    // Bar
    doc.setFillColor(r, g, b)
    doc.roundedRect(BAR_X, y, barW, 4, 1, 1, 'F')

    // Value + pct (right-aligned)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(
      `${formatCurrency(amount, currency)} (${Math.round(pct * 100)}%)`,
      PAGE_W - MARGIN,
      y + 3.5,
      { align: 'right' }
    )
    y += 10
  }

  // Transaction table
  y += 5
  autoTable(doc, {
    startY: y,
    head: [[tr?.extrato.dateLabel ?? 'Dia', tr?.extrato.descriptionLabel ?? 'Descrição', tr?.extrato.categoryLabel ?? 'Categoria', tr?.pdf.total ?? 'Valor']],
    body: transactions.map((t) => {
      const [yr, mo, day] = t.dia.split('-')
      return [
        `${day}/${mo}/${yr}`,
        t.descricao,
        getCategoryLabel(t.tag, locale),
        formatCurrency(Number(t.valor), currency, locale),
      ]
    }),
    styles: {
      fillColor: BG_CARD,
      textColor: TEXT_WHITE,
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: ACCENT,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      3: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: MARGIN, right: MARGIN },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFillColor(...BG_DARK)
    doc.rect(0, 285, PAGE_W, 12, 'F')
    doc.setFontSize(7)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(`${tr?.pdf.footer ?? 'Gerado pelo Julius'} · ${new Date().toLocaleDateString(locale)}`, MARGIN, 291)
    doc.text(`${i}/${pageCount}`, PAGE_W - MARGIN, 291, { align: 'right' })
  }

  return doc
}
