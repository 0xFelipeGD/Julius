'use client'

import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0">
      <button
        type="button"
        aria-label="Close confirmation"
        className="absolute inset-0 bg-[rgba(38,29,52,0.42)]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm rounded-[24px] bg-julius-card p-4 shadow-[0_22px_64px_rgba(56,42,77,0.24)]"
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              destructive ? 'bg-julius-danger-soft text-julius-danger' : 'bg-julius-accent-soft text-julius-accent'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-julius-text">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-julius-muted">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-julius-muted transition hover:bg-julius-raised hover:text-julius-text disabled:opacity-45"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-julius-border bg-julius-raised py-3 text-sm font-medium text-julius-muted transition hover:text-julius-text disabled:opacity-45"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl py-3 text-sm font-medium text-julius-on-accent transition active:scale-[0.98] disabled:opacity-60 ${
              destructive ? 'bg-julius-danger' : 'bg-julius-accent'
            }`}
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
