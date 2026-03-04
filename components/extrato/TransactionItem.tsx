'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Transacao, Tag } from '@/lib/types'

const TAG_CONFIG: Record<Tag, { label: string; color: string; bg: string; icon: string }> = {
  Alimentacao: { label: 'Alimentação', color: 'text-green-500', bg: 'bg-green-600/20', icon: '🍽️' },
  Transporte: { label: 'Transporte', color: 'text-blue-500', bg: 'bg-blue-600/20', icon: '🚗' },
  Saude: { label: 'Saúde', color: 'text-red-500', bg: 'bg-red-600/20', icon: '🏥' },
  Lazer: { label: 'Lazer', color: 'text-purple-500', bg: 'bg-purple-600/20', icon: '🎮' },
  Habitacao: { label: 'Habitação', color: 'text-yellow-500', bg: 'bg-yellow-600/20', icon: '🏠' },
  Outros: { label: 'Outros', color: 'text-slate-400', bg: 'bg-slate-600/20', icon: '📦' },
}

interface TransactionItemProps {
  transaction: Transacao
  onDelete: (id: string) => void
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [startX, setStartX] = useState(0)
  const tag = TAG_CONFIG[transaction.tag]

  function handleTouchStart(e: React.TouchEvent) {
    setStartX(e.touches[0].clientX)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = startX - e.changedTouches[0].clientX
    if (diff > 80) {
      setShowDelete(true)
    } else if (diff < -40) {
      setShowDelete(false)
    }
  }

  function handleDelete() {
    if (confirm('Tens a certeza? O Julius não vai gostar de perder registos.')) {
      onDelete(transaction.id)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`flex items-center gap-3 px-4 py-3 transition-transform duration-200 ${
          showDelete ? '-translate-x-20' : 'translate-x-0'
        }`}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tag.bg}`}>
          <span className="text-base">{tag.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-julius-text truncate">{transaction.descricao}</p>
          <p className="text-xs text-julius-muted">{tag.label} · {formatTime(transaction.hora)}</p>
        </div>
        <p className="text-sm font-semibold text-julius-text shrink-0">
          {formatCurrency(transaction.valor)}
        </p>
      </div>

      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute right-0 top-0 flex h-full w-20 items-center justify-center bg-julius-danger text-white text-sm font-medium"
        >
          Apagar
        </button>
      )}
    </div>
  )
}
