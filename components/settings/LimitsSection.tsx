'use client'

import { useState, useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'
import { CATEGORIES } from '@/lib/categories'
import { formatCurrency, getCurrencySymbol } from '@/lib/utils/currency'
import { useTranslation } from '@/lib/i18n'
import type { Tag, Limites, LimitePeriodo } from '@/lib/types'

function getColorFor(key: string) {
  return CATEGORIES.find((c) => c.value === key)?.color
}

export function LimitsSection() {
  const t = useTranslation()
  const { currency, limites, saveLimites } = useUserSettings()
  const currencySymbol = getCurrencySymbol(currency)

  const LIMITE_KEYS: { key: Tag | 'all'; label: string; color?: string }[] = [
    { key: 'all', label: t.settings.general },
    ...CATEGORIES.map((c) => ({ key: c.value as Tag | 'all', label: c.label, color: c.color })),
  ]

  function getLabelFor(key: string) {
    return LIMITE_KEYS.find((r) => r.key === key)?.label ?? key
  }

  const [limitesLocal, setLimitesLocal] = useState<Limites>({})
  const [savingLimites, setSavingLimites] = useState(false)
  const [selectedKey, setSelectedKey] = useState<Tag | 'all'>('all')
  const [inputDiario, setInputDiario] = useState('')
  const [inputMensal, setInputMensal] = useState('')

  useEffect(() => {
    setLimitesLocal(limites ?? {})
  }, [limites])

  useEffect(() => {
    const l = limitesLocal[selectedKey]
    setInputDiario(l?.diario != null ? String(l.diario) : '')
    setInputMensal(l?.mensal != null ? String(l.mensal) : '')
  }, [selectedKey, limitesLocal])

  function applyCurrentInputs() {
    const diario = inputDiario ? parseFloat(inputDiario.replace(',', '.')) : null
    const mensal = inputMensal ? parseFloat(inputMensal.replace(',', '.')) : null
    const limiteKey: LimitePeriodo = {
      diario: diario && !isNaN(diario) ? diario : null,
      mensal: mensal && !isNaN(mensal) ? mensal : null,
    }
    return { ...limitesLocal, [selectedKey]: limiteKey }
  }

  async function handleSaveLimites() {
    setSavingLimites(true)
    try {
      const updated = applyCurrentInputs()
      await saveLimites(updated)
      setLimitesLocal(updated)
    } finally {
      setSavingLimites(false)
    }
  }

  function handleRemoveLimite(key: string) {
    const updated = { ...limitesLocal }
    delete updated[key as Tag | 'all']
    setLimitesLocal(updated)
    saveLimites(updated)
  }

  const limitesDefinidos = Object.entries(limitesLocal).filter(
    ([, v]) => v.diario != null || v.mensal != null
  )

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">{t.settings.limitsTitle}</h2>
      <div className="rounded-xl bg-julius-card border border-julius-border p-4 space-y-3">
        {/* Category selector */}
        <div className="relative">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value as Tag | 'all')}
            className="w-full appearance-none rounded-xl border border-julius-border bg-julius-bg px-3 py-2.5 text-sm text-julius-text focus:border-julius-accent focus:outline-none cursor-pointer"
          >
            {LIMITE_KEYS.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="h-4 w-4 text-julius-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Daily + Monthly inputs */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-julius-muted">{t.settings.dailyLimit} ({currencySymbol})</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={inputDiario}
              onChange={(e) => setInputDiario(e.target.value)}
              className="w-full rounded-xl border border-julius-border bg-julius-bg px-3 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-julius-muted">{t.settings.monthlyLimit} ({currencySymbol})</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={inputMensal}
              onChange={(e) => setInputMensal(e.target.value)}
              className="w-full rounded-xl border border-julius-border bg-julius-bg px-3 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveLimites}
          disabled={savingLimites}
          className="w-full rounded-xl bg-julius-accent py-2.5 text-sm font-medium text-white disabled:opacity-50 active:opacity-80"
        >
          {savingLimites ? t.settings.savingLimit : t.settings.saveLimit}
        </button>

        {limitesDefinidos.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-julius-muted">{t.settings.limitesDefined}</p>
            {limitesDefinidos.map(([key, v]) => {
              const color = getColorFor(key)
              const label = getLabelFor(key)
              const parts = []
              if (v.diario != null) parts.push(`${t.settings.dailyLimit}: ${formatCurrency(v.diario, currency)}`)
              if (v.mensal != null) parts.push(`${t.settings.monthlyLimit}: ${formatCurrency(v.mensal, currency)}`)
              return (
                <div key={key} className="flex items-center justify-between rounded-lg bg-julius-bg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color ?? '#94A3B8' }}
                    />
                    <span className="text-xs text-julius-text truncate">{label}</span>
                    <span className="text-xs text-julius-muted truncate">{parts.join(' · ')}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveLimite(key)}
                    className="ml-2 shrink-0 text-julius-muted hover:text-julius-danger"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
