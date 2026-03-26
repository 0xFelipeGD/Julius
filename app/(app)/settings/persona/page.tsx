'use client'

import Link from 'next/link'
import { PersonaSelector } from '@/components/settings/PersonaSelector'

export default function PersonaPage() {
  return (
    <div className="px-4 py-4 pb-8">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1.5 text-sm text-julius-muted hover:text-julius-text transition-colors mb-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Settings
      </Link>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">Persona</h2>
      <PersonaSelector />
    </div>
  )
}
