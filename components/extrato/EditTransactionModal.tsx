'use client'

import { useState, useEffect } from 'react'
import { CATEGORIES, getCategoryLabel } from '@/lib/categories'
import { useTranslation } from '@/lib/i18n'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getRegionConfig } from '@/lib/config/regions'
import type { Transacao, Tag } from '@/lib/types'

interface EditTransactionModalProps {
  transaction: Transacao | null
  onSave: (id: string, updates: { valor: number; tag: Tag; descricao: string; dia: string }) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function EditTransactionModal({ transaction, onSave, onDelete, onClose }: EditTransactionModalProps) {
  const t = useTranslation()
  const region = useUserSettingsStore((s) => s.region)
  const locale = region ? getRegionConfig(region).locale : 'pt-PT'
  const [valor, setValor] = useState('')
  const [tag, setTag] = useState<Tag>('Outros')
  const [descricao, setDescricao] = useState('')
  const [dia, setDia] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (transaction) {
      setValor(String(transaction.valor))
      setTag(transaction.tag)
      setDescricao(transaction.descricao)
      setDia(transaction.dia)
    }
  }, [transaction])

  if (!transaction) return null

  async function handleSave() {
    if (saving) return
    const v = parseFloat(valor.replace(',', '.'))
    if (isNaN(v) || v <= 0 || !descricao.trim() || !dia) return
    setSaving(true)
    try {
      onSave(transaction!.id, { valor: v, tag, descricao: descricao.trim(), dia })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  function handleDelete() {
    onDelete(transaction!.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative flex max-h-[90dvh] flex-col rounded-t-2xl bg-julius-card">
        {/* Handle + Header — fixo no topo */}
        <div className="shrink-0 px-4 pt-4 pb-3">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-julius-border" />
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-julius-text">{t.extrato.editTitle}</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-julius-muted hover:text-julius-text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Campos — scroll se necessário */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          <div className="space-y-4">
            {/* Descrição */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-julius-muted">{t.extrato.descriptionLabel}</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-bg px-3 py-2.5 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
              />
            </div>

            {/* Valor */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-julius-muted">{t.extrato.amountLabel}</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-bg px-3 py-2.5 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-julius-muted">{t.extrato.categoryLabel}</label>
              <div className="relative">
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value as Tag)}
                  className="w-full appearance-none rounded-xl border border-julius-border bg-julius-bg px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{getCategoryLabel(c.value, locale)}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Data */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-julius-muted">{t.extrato.dateLabel}</label>
              <input
                type="date"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className="w-full rounded-xl border border-julius-border bg-julius-bg px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        </div>

        {/* Botões — fixo no fundo */}
        <div className="safe-bottom shrink-0 flex gap-3 border-t border-julius-border px-4 py-3">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 rounded-xl border border-julius-danger px-4 py-3 text-sm font-medium text-julius-danger active:opacity-70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            {t.extrato.deleteLabel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !descricao.trim() || !valor || !dia}
            className="flex-1 rounded-xl bg-julius-accent py-3 text-sm font-medium text-white disabled:opacity-50 active:opacity-80"
          >
            {saving ? t.extrato.savingLabel : t.extrato.saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
