'use client'

import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useUserSettings } from '@/hooks/useUserSettings'
import { getPersonasForRegion, getPersonaImage } from '@/lib/prompts'
import type { RegionCode } from '@/lib/types'

export function PersonaSelector() {
  const { region, persona } = useUserSettingsStore()
  const { savePersona } = useUserSettings()

  const regionCode = (region ?? 'PT') as RegionCode
  const availablePersonas = getPersonasForRegion(regionCode)
  const activePersonaId = persona ?? 'julius'

  return (
    <div className="space-y-2">
      {availablePersonas.map((p) => {
        const isActive = activePersonaId === p.id
        return (
          <button
            key={p.id}
            onClick={() => savePersona(p.id === 'julius' ? null : p.id)}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
              isActive
                ? 'border-julius-accent bg-julius-accent/10'
                : 'border-julius-border bg-julius-card hover:border-julius-accent/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-julius-border">
                <img
                  src={getPersonaImage(p.id)}
                  alt={p.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/personas/julius.png' }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-julius-text">{p.name}</p>
                <p className="text-xs text-julius-muted mt-0.5">{p.tagline}</p>
                <p className="text-xs text-julius-muted/70 italic mt-1 truncate">&ldquo;{p.sampleQuote}&rdquo;</p>
              </div>
              {isActive && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 shrink-0 text-julius-accent">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
