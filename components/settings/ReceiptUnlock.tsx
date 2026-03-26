'use client'

import { useState } from 'react'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useUserSettings } from '@/hooks/useUserSettings'
import { RECEIPT_UNLOCK_CODE } from '@/lib/config/features'

export function ReceiptUnlock() {
  const receiptPhotosEnabled = useUserSettingsStore((s) => s.receiptPhotosEnabled)
  const { saveReceiptPhotosEnabled } = useUserSettings()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  async function handleUnlock() {
    if (code.trim() === RECEIPT_UNLOCK_CODE) {
      setError(false)
      await saveReceiptPhotosEnabled(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (receiptPhotosEnabled) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-julius-success/30 bg-julius-success/10 px-3 py-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-julius-success shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <span className="text-sm text-julius-success font-medium">Fotos de recibos ativadas</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de acesso"
          className={`flex-1 rounded-xl border px-3 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:outline-none ${
            error ? 'border-julius-danger bg-julius-danger/10' : 'border-julius-border bg-julius-bg focus:border-julius-accent'
          }`}
          onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
        />
        <button
          onClick={handleUnlock}
          className="rounded-xl bg-julius-accent px-4 py-2 text-sm font-medium text-white active:opacity-80"
        >
          Desbloquear
        </button>
      </div>
      {error && (
        <p className="text-xs text-julius-danger">Código inválido.</p>
      )}
    </div>
  )
}
