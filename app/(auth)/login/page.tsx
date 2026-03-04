'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AuthMode = 'magic-link' | 'password' | 'register'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<AuthMode>('magic-link')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleMagicLink() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/chat` },
    })
    setLoading(false)
    if (error) {
      setError('O Julius não conseguiu enviar o email. Tenta de novo.')
    } else {
      setMessage('Verifica o teu email! O Julius enviou-te um link mágico.')
    }
  }

  async function handlePassword() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Email ou password errados. O Julius está desconfiado...')
    } else {
      router.push('/chat')
      router.refresh()
    }
  }

  async function handleRegister() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/chat` },
    })
    setLoading(false)
    if (error) {
      setError('Não foi possível criar a conta. Tenta outro email.')
    } else {
      setMessage('Conta criada! Verifica o teu email para confirmar.')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (mode === 'magic-link') handleMagicLink()
    else if (mode === 'password') handlePassword()
    else handleRegister()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full">
          <img src="/julius.png" alt="Julius" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-julius-text">JULIUS</h1>
        <p className="mt-1 text-sm text-julius-muted">O teu agente financeiro pessoal</p>
      </div>

      {message ? (
        <div className="rounded-xl bg-julius-card p-6 text-center">
          <p className="text-julius-text">{message}</p>
          <button
            onClick={() => setMessage('')}
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

          {(mode === 'password' || mode === 'register') && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-julius-border bg-julius-card px-4 py-3 text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
            />
          )}

          {error && (
            <p className="text-sm text-julius-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-xl bg-julius-accent py-3 font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {loading
              ? 'A processar...'
              : mode === 'magic-link'
              ? 'Entrar com Magic Link'
              : mode === 'password'
              ? 'Entrar'
              : 'Criar Conta'}
          </button>

          <div className="flex justify-center gap-4 text-sm">
            {mode !== 'magic-link' && (
              <button type="button" onClick={() => setMode('magic-link')} className="text-julius-accent">
                Magic Link
              </button>
            )}
            {mode !== 'password' && (
              <button type="button" onClick={() => setMode('password')} className="text-julius-accent">
                Email & Password
              </button>
            )}
            {mode !== 'register' && (
              <button type="button" onClick={() => setMode('register')} className="text-julius-accent">
                Criar Conta
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
