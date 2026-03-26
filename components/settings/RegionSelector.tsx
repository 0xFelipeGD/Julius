'use client'

import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useUserSettings } from '@/hooks/useUserSettings'
import { REGIONS } from '@/lib/config/regions'
import type { RegionCode } from '@/lib/types'

export function RegionSelector() {
  const region = useUserSettingsStore((s) => s.region)
  const { saveRegion } = useUserSettings()

  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.values(REGIONS) as import('@/lib/config/regions').RegionConfig[]).map((r) => (
        <button
          key={r.code}
          onClick={() => saveRegion(r.code as RegionCode)}
          className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
            region === r.code
              ? 'border-julius-accent bg-julius-accent/10 text-julius-text'
              : 'border-julius-border bg-julius-card text-julius-muted hover:border-julius-accent/50'
          }`}
        >
          <span className="text-lg">{r.flag}</span>
          <div className="min-w-0">
            <p className="font-medium text-xs truncate">{r.nameEnglish}</p>
            <p className="text-[11px] text-julius-muted">{r.currencyName}</p>
          </div>
        </button>
      ))}
    </div>
  )
}
