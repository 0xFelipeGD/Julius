'use client'

import { useTranslation } from '@/lib/i18n'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTranslation()

  return (
    <div className="relative px-4 pb-2">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-julius-muted pointer-events-none"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.extrato.search}
          className="w-full rounded-xl border border-julius-border bg-julius-card pl-9 pr-4 py-2 text-sm text-julius-text placeholder:text-julius-muted focus:border-julius-accent focus:outline-none"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-julius-muted hover:text-julius-text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
