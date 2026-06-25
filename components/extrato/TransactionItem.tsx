'use client'

import { useRef, useState } from 'react'
import { CategoryIcon } from '@/components/CategoryIcon'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getCategoryDisplay } from '@/lib/categories'
import { formatCurrency } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Transacao } from '@/lib/types'

interface TransactionItemProps {
  transaction: Transacao
  onDelete: (id: string) => void
  onEdit: (transaction: Transacao) => void
}

export function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [startX, setStartX] = useState(0)
  const swipedRef = useRef(false)
  const category = getCategoryDisplay(transaction.category, transaction.tag)

  function handleTouchStart(event: React.TouchEvent) {
    setStartX(event.touches[0].clientX)
    swipedRef.current = false
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const diff = startX - event.changedTouches[0].clientX
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
    setDeleteOpen(true)
  }

  return (
    <div className="relative overflow-hidden">
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-transform duration-200 active:bg-julius-card/70 ${
          showDelete ? '-translate-x-20' : 'translate-x-0'
        }`}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
          style={{ backgroundColor: `${category.color}22`, color: category.color }}
        >
          <CategoryIcon icon={category.icon} className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-julius-text">{transaction.descricao}</p>
          <p className="truncate text-xs text-julius-muted">{category.name} · {formatTime(transaction.hora)}</p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-julius-text">
          {formatCurrency(transaction.valor)}
        </p>
      </div>

      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute right-0 top-0 flex h-full w-20 items-center justify-center bg-julius-danger text-sm font-medium text-julius-on-accent"
        >
          Delete
        </button>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete transaction?"
        message="This transaction will be removed from your statement."
        confirmLabel="Delete"
        destructive
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(transaction.id)
          setDeleteOpen(false)
          setShowDelete(false)
        }}
      />
    </div>
  )
}
