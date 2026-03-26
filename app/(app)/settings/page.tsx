'use client'

import Link from 'next/link'
import { HelpSection } from '@/components/settings/HelpSection'
import { AccountSection } from '@/components/settings/AccountSection'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getPersona } from '@/lib/prompts'
import { REGIONS } from '@/lib/config/regions'
import { useTranslation } from '@/lib/i18n'
import type { RegionCode } from '@/lib/types'

function ChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0 text-julius-muted">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}

interface NavRowProps {
  href: string
  icon: React.ReactNode
  label: string
  value?: string
}

function NavRow({ href, icon, label, value }: NavRowProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-julius-border bg-julius-card px-4 py-3 transition-colors hover:border-julius-accent/50"
    >
      <span className="text-julius-muted">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-julius-text">{label}</p>
        {value && <p className="text-xs text-julius-muted mt-0.5 truncate">{value}</p>}
      </div>
      <ChevronRight />
    </Link>
  )
}

export default function SettingsPage() {
  const { region, persona } = useUserSettingsStore()
  const t = useTranslation()
  const regionConfig = region ? REGIONS[region as RegionCode] : null
  const personaConfig = getPersona(persona)

  return (
    <div className="px-4 py-4 space-y-6 pb-8">

      {/* General navigation rows */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">{t.settings.general}</h2>
        <div className="space-y-2">
          <NavRow
            href="/settings/region"
            label={t.settings.regionTitle}
            value={regionConfig ? `${regionConfig.flag} ${regionConfig.nameEnglish} · ${regionConfig.currencyName}` : undefined}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
          />

          <NavRow
            href="/settings/persona"
            label={t.settings.personaTitle}
            value={personaConfig.name}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            }
          />

          <NavRow
            href="/settings/receipt"
            label={t.settings.receiptPhotos}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            }
          />

          <NavRow
            href="/settings/limits"
            label={t.settings.limitsTitle}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Help */}
      <HelpSection />

      {/* Account */}
      <AccountSection />

    </div>
  )
}
