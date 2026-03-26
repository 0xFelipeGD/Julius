'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n'

export function AccountSection() {
  const router = useRouter()
  const [resetting, setResetting] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const t = useTranslation()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleReset() {
    setResetting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expired.')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const res = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('delete-account error:', err)
      setDeletingAccount(false)
      setConfirmDelete(false)
    }
  }

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">{t.settings.accountTitle}</h2>
      <div className="rounded-xl bg-julius-card border border-julius-border overflow-hidden divide-y divide-julius-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-julius-text hover:bg-julius-bg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-julius-muted">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          {t.settings.logout}
        </button>

        {confirmReset ? (
          <div className="px-4 py-3 bg-julius-bg">
            <p className="text-sm text-julius-warning mb-3 font-medium">{t.settings.resetConfirm}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-lg bg-julius-card py-2 text-sm font-medium text-julius-muted border border-julius-border">{t.settings.cancel}</button>
              <button onClick={handleReset} disabled={resetting} className="flex-1 rounded-lg bg-julius-danger py-2 text-sm font-medium text-white disabled:opacity-60">
                {resetting ? t.settings.erasing : t.settings.eraseAll}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmReset(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-julius-warning hover:bg-julius-bg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            {t.settings.resetData}
          </button>
        )}

        {confirmDelete ? (
          <div className="px-4 py-3 bg-julius-bg">
            <p className="text-sm text-julius-danger mb-3 font-medium">{t.settings.deleteConfirm}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg bg-julius-card py-2 text-sm font-medium text-julius-muted border border-julius-border">{t.settings.cancel}</button>
              <button onClick={handleDeleteAccount} disabled={deletingAccount} className="flex-1 rounded-lg bg-julius-danger py-2 text-sm font-medium text-white disabled:opacity-60">
                {deletingAccount ? t.settings.eliminating : t.settings.deleteAccount}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="flex w-full items-center gap-3 px-4 py-3.5 text-sm font-medium text-julius-danger hover:bg-julius-bg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            {t.settings.deleteAccount}
          </button>
        )}
      </div>
    </section>
  )
}
