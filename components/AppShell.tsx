'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const tabs = [
  {
    href: '/chat',
    label: 'Chat',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
  },
  {
    href: '/extrato',
    label: 'Extrato',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-6 w-6 ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
]

function getTabLabel(pathname: string): string {
  if (pathname.startsWith('/chat')) return 'Chat'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/extrato')) return 'Extrato'
  return 'Julius'
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const setUser = useAuthStore((s) => s.setUser)
  const [resetting, setResetting] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      })
  )

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUser(user.id, user.email ?? '')
    }
    loadUser()
  }, [setUser])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Excluir a conta permanentemente? Não há volta atrás. O Julius vai chorar.'
    )
    if (!confirmed) return

    setDeletingAccount(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
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
    } finally {
      setDeletingAccount(false)
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      'Apagar TUDO? Transacções, histórico de chat, tudo. O Julius vai ficar em choque.'
    )
    if (!confirmed) return

    setResetting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await Promise.all([
        supabase.from('transacoes').delete().eq('user_id', user.id),
        supabase.from('chat_history').delete().eq('user_id', user.id),
      ])

      // Invalidate all queries so UI refreshes
      queryClient.clear()
      window.location.href = '/chat'
    } finally {
      setResetting(false)
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-dvh flex-col">
        <header className="safe-top flex items-center justify-between border-b border-julius-border bg-julius-bg px-4 pb-3 pt-3">
          <h1 className="text-lg font-semibold text-julius-text">
            {getTabLabel(pathname)}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-full text-julius-muted transition-colors hover:text-julius-text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
              </svg>
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              title="Excluir conta"
              className="flex h-8 w-8 items-center justify-center rounded-full text-julius-muted transition-colors hover:text-julius-danger disabled:opacity-50"
            >
              {deletingAccount ? (
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              title="Limpar todos os dados"
              className="flex h-8 w-8 items-center justify-center rounded-full text-julius-muted transition-colors hover:text-julius-danger disabled:opacity-50"
            >
              {resetting ? (
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              )}
            </button>
            <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
              <img src="/julius.png" alt="Julius" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        <nav className="safe-bottom flex items-center justify-around border-t border-julius-border bg-julius-bg px-2 pb-2 pt-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5 px-4 py-1"
              >
                {tab.icon(isActive)}
                <span className={`text-xs ${isActive ? 'text-julius-accent font-medium' : 'text-julius-muted'}`}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </QueryClientProvider>
  )
}
