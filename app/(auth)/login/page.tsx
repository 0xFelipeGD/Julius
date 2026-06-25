'use client'

import { AlertTriangle, Landmark } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { InstallJuliusAction } from '@/components/InstallJuliusAction'
import { useTranslation } from '@/lib/i18n'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const t = useTranslation()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(t.login.wrongCredentials)
      } else {
        router.push('/chat')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/chat` },
      })
      setLoading(false)
      if (error) {
        setError(t.login.signupError)
      } else {
        setSuccess(t.login.signupSuccess)
      }
    }
  }

  return (
    <div className="w-full max-w-sm px-1 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[22px] bg-julius-accent-soft text-julius-accent">
          <Landmark className="h-9 w-9" strokeWidth={1.8} />
        </div>
        <h1 className="text-3xl font-semibold text-julius-text">Julius</h1>
        <p className="mt-1 text-sm text-julius-muted">{t.login.subtitle}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 border-b border-julius-border">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); setSuccess('') }}
          className={`border-b-2 py-3 text-sm font-medium transition ${
            mode === 'login' ? 'border-julius-accent text-julius-text' : 'border-transparent text-julius-muted'
          }`}
        >
          {t.login.loginTab}
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
          className={`border-b-2 py-3 text-sm font-medium transition ${
            mode === 'signup' ? 'border-julius-accent text-julius-text' : 'border-transparent text-julius-muted'
          }`}
        >
          {t.login.signupTab}
        </button>
      </div>

      {success ? (
        <div className="rounded-xl bg-julius-card border border-julius-border p-6 text-center">
          <p className="text-julius-text">{success}</p>
          <button
            onClick={() => setSuccess('')}
            className="mt-4 text-sm text-julius-accent"
          >
            {t.login.back}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t.login.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-julius-border bg-julius-raised px-4 py-3 text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
          />

          <input
            type="password"
            placeholder={t.login.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-julius-border bg-julius-raised px-4 py-3 text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-julius-danger/30 bg-julius-danger-soft px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-julius-danger" />
              <p className="text-sm text-julius-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-julius-accent py-3 font-semibold text-julius-on-accent transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? t.login.processing : mode === 'login' ? t.login.loginButton : t.login.signupButton}
          </button>
        </form>
      )}
      <div className="mt-6">
        <InstallJuliusAction />
      </div>
    </div>
  )
}
