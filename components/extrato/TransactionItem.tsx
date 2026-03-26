'use client'

import { useState, useRef } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getCategoryLabel, CATEGORY_EMOJIS, CATEGORY_BG_MUTED, CATEGORY_TEXT } from '@/lib/categories'
import { useTranslation } from '@/lib/i18n'
import { getRegionConfig } from '@/lib/config/regions'
import type { Transacao } from '@/lib/types'

interface TransactionItemProps {
  transaction: Transacao
  onDelete: (id: string) => void
  onEdit: (t: Transacao) => void
}

export function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
  const t = useTranslation()
  const [showDelete, setShowDelete] = useState(false)
  const [startX, setStartX] = useState(0)
  const swipedRef = useRef(false)
  const currency = useUserSettingsStore((s) => s.currency)
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'

  function handleTouchStart(e: React.TouchEvent) {
    setStartX(e.touches[0].clientX)
    swipedRef.current = false
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = startX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 15) {
      swipedRef.current = true
      if (diff > 80) setShowDelete(true)
      else if (diff < -40) setShowDelete(false)
    }
  }

  function handleClick() {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    if (showDelete) {
      setShowDelete(false)
      return
    }
    onEdit(transaction)
  }

  function handleDelete() {
    if (confirm(t.extrato.deleteConfirm)) {
      onDelete(transaction.id)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-transform duration-200 active:bg-julius-card/50 ${
          showDelete ? '-translate-x-20' : 'translate-x-0'
        }`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${CATEGORY_BG_MUTED[transaction.tag]}`}>
          <span className="text-base">{CATEGORY_EMOJIS[transaction.tag]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-julius-text truncate">{transaction.descricao}</p>
          <p className={`text-xs ${CATEGORY_TEXT[transaction.tag]}`}>{getCategoryLabel(transaction.tag, locale)} · {formatTime(transaction.hora)}</p>
        </div>
        <p className="text-sm font-semibold text-julius-text shrink-0">
          {formatCurrency(transaction.valor, currency)}
        </p>
      </div>

      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute right-0 top-0 flex h-full w-20 items-center justify-center bg-julius-danger text-white text-sm font-medium"
        >
          {t.extrato.deleteLabel}
        </button>
      )}
    </div>
  )
}
