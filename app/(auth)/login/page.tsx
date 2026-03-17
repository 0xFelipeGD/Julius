'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { canInstall, install } = useInstallPrompt()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError('Email ou password errados. O Julius está desconfiado...')
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
        setError('Não foi possível criar a conta. Tenta outro email.')
      } else {
        setSuccess('Conta criada! Verifica o teu email para confirmar.')
      }
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full ring-4 ring-julius-border animate-pulse">
          <img src="/julius.png" alt="Julius" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-julius-text">JULIUS</h1>
        <p className="mt-1 text-sm text-julius-muted">O teu agente financeiro pessoal</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex rounded-xl overflow-hidden border border-julius-border">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); setSuccess('') }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'login' ? 'bg-julius-accent text-white' : 'bg-julius-card text-julius-muted'
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); setSuccess('') }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === 'signup' ? 'bg-julius-accent text-white' : 'bg-julius-card text-julius-muted'
          }`}
        >
          Criar Conta
        </button>
      </div>

      {success ? (
        <div className="rounded-xl bg-julius-card border border-julius-border p-6 text-center">
          <p className="text-julius-text">{success}</p>
          <button
            onClick={() => setSuccess('')}
            className="mt-4 text-sm text-julius-accent"
          >
            Voltar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="O teu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-julius-border bg-julius-card px-4 py-3 text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-julius-border bg-julius-card px-4 py-3 text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
          />

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-julius-card border border-julius-danger/30 px-3 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-julius-danger">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-julius-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full rounded-xl bg-julius-accent py-3 font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading ? 'A processar...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
      )}
      {canInstall && (
        <button
          type="button"
          onClick={install}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-julius-border bg-julius-card py-3 text-sm font-medium text-julius-muted transition-colors hover:text-julius-text"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Instalar Julius como App
        </button>
      )}
    </div>
  )
}
