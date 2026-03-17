'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserSettings } from '@/hooks/useUserSettings'
import { JuliusLightbox } from '@/components/JuliusLightbox'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { IOSInstallHint } from '@/components/IOSInstallHint'

const tabs = [
  {
    href: '/chat',
    label: 'Chat',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 transition-colors ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 transition-colors ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 17V9M13 17V5M8 17v-3" />
      </svg>
    ),
  },
  {
    href: '/extrato',
    label: 'Extrato',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 transition-colors ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Config',
    icon: (active: boolean) => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-5 w-5 transition-colors ${active ? 'text-julius-accent' : 'text-julius-muted'}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
]

function getTabLabel(pathname: string): string {
  if (pathname.startsWith('/chat')) return 'Chat'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/extrato')) return 'Extrato'
  if (pathname.startsWith('/settings')) return 'Configurações'
  return 'Julius'
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { loadSettings } = useUserSettings()

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await loadSettings()
      }
    }
    init()
  }, [loadSettings])

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="safe-top flex items-center justify-between border-b border-julius-border bg-julius-bg px-4 pb-3 pt-3">
        <h1 className="text-base font-semibold tracking-tight text-julius-text">
          {getTabLabel(pathname)}
        </h1>
        <button
          onClick={() => setLightboxOpen(true)}
          className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-julius-border hover:ring-julius-accent transition-all active:scale-95"
          aria-label="Ver Julius"
        >
          <img src="/julius.png" alt="Julius" className="h-full w-full object-cover" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>

      {/* Nav */}
      <nav className="safe-bottom flex items-center border-t border-julius-border bg-julius-bg px-1 pt-1 pb-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-julius-accent" />
              )}
              {tab.icon(isActive)}
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-julius-accent' : 'text-julius-muted'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <IOSInstallHint />
      <JuliusLightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppShellInner>{children}</AppShellInner>
    </QueryClientProvider>
  )
}
