'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import type { TransacaoPendente, Tag } from '@/lib/types'

const TAG_CONFIG: Record<Tag, { label: string; color: string; icon: string }> = {
  Alimentacao: { label: 'Alimentação', color: 'bg-green-600', icon: '🍽️' },
  Transporte: { label: 'Transporte', color: 'bg-blue-600', icon: '🚗' },
  Saude: { label: 'Saúde', color: 'bg-red-600', icon: '🏥' },
  Lazer: { label: 'Lazer', color: 'bg-purple-600', icon: '🎮' },
  Habitacao: { label: 'Habitação', color: 'bg-yellow-600', icon: '🏠' },
  Outros: { label: 'Outros', color: 'bg-slate-500', icon: '📦' },
}

interface TransactionConfirmProps {
  transacao: TransacaoPendente
  onConfirm: (t: TransacaoPendente) => void
  onCorrect: (t: TransacaoPendente, correction: string) => void
}

export function TransactionConfirm({ transacao, onConfirm, onCorrect }: TransactionConfirmProps) {
  const [correcting, setCorrecting] = useState(false)
  const [correction, setCorrection] = useState('')
  const tag = TAG_CONFIG[transacao.tag]

  function handleCorrect() {
    if (correction.trim()) {
      onCorrect(transacao, correction.trim())
      setCorrecting(false)
      setCorrection('')
    }
  }

  return (
    <div className="rounded-xl border border-julius-border bg-julius-card p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tag.color}`}>
          <span className="text-lg">{tag.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-julius-text">{formatCurrency(transacao.valor)}</p>
          <p className="text-sm text-julius-muted">{tag.label}</p>
        </div>
      </div>

      <p className="mb-1 text-sm text-julius-text">{transacao.descricao}</p>
      <p className="mb-4 text-xs text-julius-muted">{transacao.dia} às {transacao.hora}</p>

      {correcting ? (
        <div className="space-y-2">
          <textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="O que está errado? (ex: o valor é 5€, não 50€)"
            className="w-full rounded-lg bg-julius-bg px-3 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:outline-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setCorrecting(false)}
              className="flex-1 rounded-lg bg-julius-bg py-2 text-sm font-medium text-julius-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleCorrect}
              disabled={!correction.trim()}
              className="flex-1 rounded-lg bg-julius-accent py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Enviar Correção
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setCorrecting(true)}
            className="flex-1 rounded-lg bg-julius-bg py-2.5 text-sm font-medium text-julius-muted"
          >
            Corrigir
          </button>
          <button
            onClick={() => onConfirm(transacao)}
            className="flex-1 rounded-lg bg-julius-success py-2.5 text-sm font-medium text-white"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  )
}
