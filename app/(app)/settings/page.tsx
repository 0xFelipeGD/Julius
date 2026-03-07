'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserSettings } from '@/hooks/useUserSettings'
import { CATEGORIES } from '@/lib/categories'
import { TutorialModal } from '@/components/TutorialModal'
import type { Currency, Tag, Limites } from '@/lib/types'

const LIMITE_ROWS: { key: Tag | 'all'; label: string; color?: string }[] = [
  { key: 'all', label: 'Geral' },
  ...CATEGORIES.map((c) => ({ key: c.value as Tag | 'all', label: c.label, color: c.color })),
]

export default function SettingsPage() {
  const router = useRouter()
  const { currency, limites, loadSettings, saveCurrency, saveLimites } = useUserSettings()
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  // Local state para limites (editável antes de guardar)
  const [limitesLocal, setLimitesLocal] = useState<Record<string, { diario: string; mensal: string }>>({})
  const [savingLimites, setSavingLimites] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Sincronizar inputs quando carregam as settings
  useEffect(() => {
    const initial: Record<string, { diario: string; mensal: string }> = {}
    for (const row of LIMITE_ROWS) {
      const l = limites[row.key]
      initial[row.key] = {
        diario: l?.diario != null ? String(l.diario) : '',
        mensal: l?.mensal != null ? String(l.mensal) : '',
      }
    }
    setLimitesLocal(initial)
  }, [limites])

  function setLimiteField(key: string, field: 'diario' | 'mensal', value: string) {
    setLimitesLocal((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function handleSaveLimites() {
    setSavingLimites(true)
    try {
      const parsed: Limites = {}
      for (const row of LIMITE_ROWS) {
        const local = limitesLocal[row.key]
        if (!local) continue
        const diario = local.diario ? parseFloat(local.diario.replace(',', '.')) : null
        const mensal = local.mensal ? parseFloat(local.mensal.replace(',', '.')) : null
        parsed[row.key] = {
          diario: diario && !isNaN(diario) ? diario : null,
          mensal: mensal && !isNaN(mensal) ? mensal : null,
        }
      }
      await saveLimites(parsed)
    } finally {
      setSavingLimites(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleReset() {
    setResetting(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await Promise.all([
        supabase.from('transacoes').delete().eq('user_id', user.id),
        supabase.from('chat_history').delete().eq('user_id', user.id),
      ])
      setConfirmReset(false)
      router.push('/chat')
    } finally {
      setResetting(false)
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true)
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada.')
      const { error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (error) throw error
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('delete-account error:', err)
      alert('Erro ao excluir conta. Tenta de novo.')
      setDeletingAccount(false)
      setConfirmDelete(false)
    }
  }

  const currencySymbol = currency === 'EUR' ? '€' : 'R$'

  return (
    <div className="px-4 py-4 space-y-6 pb-8">

      {/* Moeda */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">
          Moeda
        </h2>
        <div className="flex gap-2">
          {(['EUR', 'BRL'] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => saveCurrency(c)}
              className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors ${
                currency === c
                  ? 'border-julius-accent bg-julius-accent text-white'
                  : 'border-julius-border bg-julius-card text-julius-muted hover:text-julius-text'
              }`}
            >
              {c === 'EUR' ? '€ Euro' : 'R$ Real'}
            </button>
          ))}
        </div>
      </section>

      {/* Limites de Gasto */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">
          Limites de Gasto
        </h2>
        <div className="rounded-xl bg-julius-card border border-julius-border overflow-hidden divide-y divide-julius-border">
          {/* Cabeçalho das colunas */}
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex-1" />
            <span className="w-24 text-center text-xs font-medium text-julius-muted">Diário ({currencySymbol})</span>
            <span className="w-24 text-center text-xs font-medium text-julius-muted">Mensal ({currencySymbol})</span>
          </div>

          {LIMITE_ROWS.map((row) => (
            <div key={row.key} className="flex items-center gap-2 px-4 py-3">
              <div className="flex flex-1 items-center gap-2 min-w-0">
                {row.color ? (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                ) : (
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-julius-muted" />
                )}
                <span className="truncate text-sm text-julius-text">{row.label}</span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="—"
                value={limitesLocal[row.key]?.diario ?? ''}
                onChange={(e) => setLimiteField(row.key, 'diario', e.target.value)}
                className="w-24 rounded-lg border border-julius-border bg-julius-bg px-2 py-1.5 text-center text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
              />
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="—"
                value={limitesLocal[row.key]?.mensal ?? ''}
                onChange={(e) => setLimiteField(row.key, 'mensal', e.target.value)}
                className="w-24 rounded-lg border border-julius-border bg-julius-bg px-2 py-1.5 text-center text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
              />
            </div>
          ))}

          <div className="px-4 py-3">
            <button
              onClick={handleSaveLimites}
              disabled={savingLimites}
              className="w-full rounded-xl bg-julius-accent py-2.5 text-sm font-medium text-white disabled:opacity-50 active:opacity-80"
            >
              {savingLimites ? 'A guardar...' : 'Guardar limites'}
            </button>
          </div>
        </div>
      </section>

      {/* Tutorial */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">
          Ajuda
        </h2>
        <button
          onClick={() => setTutorialOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-julius-card border border-julius-border px-4 py-3 text-sm font-medium text-julius-text hover:border-julius-accent transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-base">📖</span>
            Como usar o Julius
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-julius-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </section>

      {/* Conta */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">
          Conta
        </h2>
        <div className="rounded-xl bg-julius-card border border-julius-border overflow-hidden divide-y divide-julius-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-julius-text hover:bg-julius-bg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-julius-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            Terminar sessão
          </button>

          {confirmReset ? (
            <div className="px-4 py-3 bg-julius-bg">
              <p className="text-sm text-julius-warning mb-3 font-medium">
                Tens a certeza? Apaga TODAS as transações e histórico do chat.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-lg bg-julius-card py-2 text-sm font-medium text-julius-muted border border-julius-border">Cancelar</button>
                <button onClick={handleReset} disabled={resetting} className="flex-1 rounded-lg bg-julius-danger py-2 text-sm font-medium text-white disabled:opacity-60">
                  {resetting ? 'A apagar...' : 'Apagar tudo'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-julius-warning hover:bg-julius-bg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Limpar todos os dados
            </button>
          )}

          {confirmDelete ? (
            <div className="px-4 py-3 bg-julius-bg">
              <p className="text-sm text-julius-danger mb-3 font-medium">
                Esta ação é irreversível. A tua conta e todos os dados serão eliminados permanentemente.
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg bg-julius-card py-2 text-sm font-medium text-julius-muted border border-julius-border">Cancelar</button>
                <button onClick={handleDeleteAccount} disabled={deletingAccount} className="flex-1 rounded-lg bg-julius-danger py-2 text-sm font-medium text-white disabled:opacity-60">
                  {deletingAccount ? 'A eliminar...' : 'Eliminar conta'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-julius-danger hover:bg-julius-bg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Eliminar conta
            </button>
          )}
        </div>
      </section>

      <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  )
}
