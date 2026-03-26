'use client'

import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useUserSettings } from '@/hooks/useUserSettings'
import { REGIONS } from '@/lib/config/regions'
import type { RegionCode } from '@/lib/types'

export function RegionGate({ children }: { children: React.ReactNode }) {
  const { region, loaded } = useUserSettingsStore()
  const { saveRegion } = useUserSettings()

  // Wait until settings are loaded before showing gate
  if (!loaded) return <>{children}</>

  // If region is set, show app normally
  if (region) return <>{children}</>

  // Show region selection screen
  async function handleSelectRegion(code: RegionCode) {
    await saveRegion(code)
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 h-16 w-16 overflow-hidden rounded-full ring-2 ring-julius-border">
          <img src="/personas/julius.png" alt="Julius" className="h-full w-full object-cover" />
        </div>
        <h2 className="text-xl font-bold text-julius-text mb-2">Choose your region</h2>
        <p className="text-sm text-julius-muted mb-8">
          This sets your currency and language. You can change it later in Settings.
        </p>
        <div className="space-y-3">
          {(Object.values(REGIONS) as import('@/lib/config/regions').RegionConfig[]).map((r) => (
            <button
              key={r.code}
              onClick={() => handleSelectRegion(r.code)}
              className="flex w-full items-center gap-4 rounded-xl border border-julius-border bg-julius-card px-4 py-3.5 text-left transition-colors hover:border-julius-accent active:scale-[0.98]"
            >
              <span className="text-2xl">{r.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-julius-text">{r.nameEnglish}</p>
                <p className="text-xs text-julius-muted">{r.currencySymbol} {r.currency}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-julius-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
