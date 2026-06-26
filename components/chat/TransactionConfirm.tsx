'use client'

import { Check, PencilLine } from 'lucide-react'
import { useState } from 'react'
import { CategoryIcon } from '@/components/CategoryIcon'
import { useCategories } from '@/hooks/useCategories'
import { getCategoryDisplay } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category, TransacaoPendente } from '@/lib/types'

interface TransactionConfirmProps {
  transacao: TransacaoPendente
  onConfirm: (t: TransacaoPendente) => Promise<void> | void
  onCorrect: (t: TransacaoPendente, correction: string) => void
}

function findCategory(categories: Category[], transacao: TransacaoPendente): Category | null {
  return (
    categories.find((category) => category.id === transacao.category_id) ??
    categories.find((category) => category.name.toLowerCase() === transacao.category_name?.toLowerCase()) ??
    categories.find((category) => category.legacy_tag === transacao.tag) ??
    categories.find((category) => category.is_fallback) ??
    null
  )
}

export function TransactionConfirm({ transacao, onConfirm, onCorrect }: TransactionConfirmProps) {
  const [correcting, setCorrecting] = useState(false)
  const [correction, setCorrection] = useState('')
  const [confirming, setConfirming] = useState(false)
  const { categories } = useCategories()
  const category = findCategory(categories, transacao)
  const display = getCategoryDisplay(category, transacao.tag)

  function handleCorrect() {
    if (!correction.trim()) return
    onCorrect(transacao, correction.trim())
    setCorrecting(false)
    setCorrection('')
  }

  async function handleConfirm() {
    if (confirming) return
    setConfirming(true)
    try {
      await onConfirm({
        ...transacao,
        category_id: category?.id ?? transacao.category_id,
        category_name: category?.name ?? transacao.category_name ?? display.name,
        tag: category?.legacy_tag ?? transacao.tag,
      })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="w-full max-w-full rounded-2xl border border-julius-border bg-julius-card p-4 shadow-[0_16px_36px_rgba(56,42,77,0.10)]">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
          style={{ backgroundColor: `${display.color}22`, color: display.color }}
        >
          <CategoryIcon icon={display.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-xl font-semibold text-julius-text [overflow-wrap:anywhere]">{formatCurrency(transacao.valor)}</p>
          <p className="truncate text-sm text-julius-muted">{display.name}</p>
        </div>
      </div>

      <p className="mb-1 break-words text-sm font-medium text-julius-text [overflow-wrap:anywhere]">{transacao.descricao}</p>
      <p className="mb-4 break-words text-xs text-julius-muted [overflow-wrap:anywhere]">{transacao.dia} at {transacao.hora}</p>

      {correcting ? (
        <div className="space-y-2">
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="What should Julius change?"
            className="w-full rounded-xl border border-julius-border bg-julius-raised px-3 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:outline-none [overflow-wrap:anywhere]"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCorrecting(false)}
              className="min-h-11 min-w-0 rounded-xl border border-julius-border bg-julius-raised px-3 py-2 text-sm font-medium text-julius-muted transition hover:text-julius-text"
            >
              <span className="block truncate whitespace-nowrap">Cancel</span>
            </button>
            <button
              onClick={handleCorrect}
              disabled={!correction.trim()}
              className="min-h-11 min-w-0 rounded-xl bg-julius-accent px-3 py-2 text-sm font-medium text-julius-on-accent transition disabled:opacity-45"
            >
              <span className="block truncate whitespace-nowrap">Send</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setCorrecting(true)}
            className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-julius-border bg-julius-raised px-3 py-2.5 text-sm font-medium text-julius-muted transition hover:text-julius-text"
          >
            <PencilLine className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate whitespace-nowrap">Correct</span>
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-julius-success px-3 py-2.5 text-sm font-medium text-julius-on-accent transition active:scale-[0.98] disabled:opacity-60"
          >
            <Check className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate whitespace-nowrap">{confirming ? 'Saving...' : 'Confirm'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
