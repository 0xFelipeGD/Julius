'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ChartNoAxesColumnIncreasing,
  CircleUserRound,
  House,
  ListChecks,
  MessageCircle,
  Repeat2,
  Settings,
} from 'lucide-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUserSettings } from '@/hooks/useUserSettings'
import { captureInstallPrompt } from '@/hooks/useInstallPrompt'
import { IOSInstallHint } from '@/components/IOSInstallHint'

const tabs = [
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/dashboard', label: 'Stats', icon: ChartNoAxesColumnIncreasing },
  { href: '/subscriptions', label: 'Subs', icon: Repeat2 },
  { href: '/fixed-costs', label: 'Fixed', icon: House },
  { href: '/extrato', label: 'List', icon: ListChecks },
  { href: '/settings', label: 'Me', icon: Settings },
]

function getTabLabel(pathname: string): string {
  if (pathname.startsWith('/chat')) return 'Chat'
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/subscriptions')) return 'Subscriptions'
  if (pathname.startsWith('/fixed-costs')) return 'Fixed costs'
  if (pathname.startsWith('/extrato')) return 'Statement'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Julius'
}

function getActiveTab(pathname: string) {
  return tabs.find((tab) => pathname.startsWith(tab.href))
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { avatarDataUrl, loadSettings } = useUserSettings()
  const activeTab = getActiveTab(pathname)
  const HeaderIcon = activeTab?.icon ?? MessageCircle

  useEffect(() => {
    const cleanup = captureInstallPrompt()
    return cleanup
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) await loadSettings()
    }
    init()
  }, [loadSettings])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-julius-bg sm:rounded-[20px]">
      <header className="safe-top border-b border-julius-border bg-julius-card px-4 pb-3 pt-3 shadow-[0_10px_26px_rgba(56,42,77,0.05)]">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-julius-accent-soft text-julius-accent">
              <HeaderIcon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-none text-julius-muted">Julius</p>
              <h1 className="mt-1 truncate text-[19px] font-semibold leading-none text-julius-text">
                {getTabLabel(pathname)}
              </h1>
            </div>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-julius-border bg-julius-raised text-julius-muted">
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="Account" className="h-full w-full object-cover" />
            ) : (
              <CircleUserRound className="h-5 w-5" strokeWidth={1.9} />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        {children}
      </main>

      <nav className="safe-bottom border-t border-julius-border bg-julius-card px-1.5 pb-1.5 pt-1.5">
        <div className="grid grid-cols-6 gap-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-medium transition duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-julius-accent-soft text-julius-accent'
                    : 'text-julius-muted hover:bg-julius-raised hover:text-julius-text'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="w-full truncate text-center">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <IOSInstallHint />
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
