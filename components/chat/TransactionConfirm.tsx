'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { CATEGORY_EMOJIS, CATEGORY_BG } from '@/lib/categories'
import { getCategoryLabel } from '@/lib/categories'
import { useTranslation } from '@/lib/i18n'
import { getRegionConfig } from '@/lib/config/regions'
import type { TransacaoPendente } from '@/lib/types'

interface TransactionConfirmProps {
  transacao: TransacaoPendente
  onConfirm: (t: TransacaoPendente) => Promise<void> | void
  onCorrect: (t: TransacaoPendente, correction: string) => void
}

export function TransactionConfirm({ transacao, onConfirm, onCorrect }: TransactionConfirmProps) {
  const t = useTranslation()
  const [correcting, setCorrecting] = useState(false)
  const [correction, setCorrection] = useState('')
  const [confirming, setConfirming] = useState(false)
  const currency = useUserSettingsStore((s) => s.currency)
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'

  function handleCorrect() {
    if (correction.trim()) {
      onCorrect(transacao, correction.trim())
      setCorrecting(false)
      setCorrection('')
    }
  }

  async function handleConfirm() {
    if (confirming) return
    setConfirming(true)
    try {
      await onConfirm(transacao)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-xl border border-julius-border bg-julius-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${CATEGORY_BG[transacao.tag]}`}>
          <span className="text-lg">{CATEGORY_EMOJIS[transacao.tag]}</span>
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-julius-text">{formatCurrency(transacao.valor, currency)}</p>
          <p className="text-sm text-julius-muted">{getCategoryLabel(transacao.tag, locale)}</p>
        </div>
      </div>

      <p className="mb-1 text-sm text-julius-text">{transacao.descricao}</p>
      <p className="mb-4 text-xs text-julius-muted">{transacao.dia} {t.confirm.at} {transacao.hora}</p>

      {correcting ? (
        <div className="space-y-2">
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder={t.confirm.correctionPlaceholder}
            className="w-full rounded-lg bg-julius-bg px-3 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:outline-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setCorrecting(false)}
              className="flex-1 rounded-lg bg-julius-bg py-2 text-sm font-medium text-julius-muted"
            >
              {t.confirm.cancel ?? 'Cancelar'}
            </button>
            <button
              onClick={handleCorrect}
              disabled={!correction.trim()}
              className="flex-1 rounded-lg bg-julius-accent py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {t.confirm.sendCorrection}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setCorrecting(true)}
            className="flex-1 rounded-lg bg-julius-bg py-2.5 text-sm font-medium text-julius-muted"
          >
            {t.confirm.correctButton}
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-1 rounded-lg bg-julius-success py-2.5 text-sm font-medium text-white disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.confirm.saving}
              </>
            ) : (
              t.confirm.confirmButton
            )}
          </button>
        </div>
      )}
    </div>
  )
}
