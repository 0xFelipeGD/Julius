'use client'

import { useEffect } from 'react'

interface JuliusLightboxProps {
  open: boolean
  onClose: () => void
}

export function JuliusLightbox({ open, onClose }: JuliusLightboxProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="relative"
        style={{
          animation: 'julius-zoom-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/julius.png"
          alt="Julius"
          className="h-72 w-72 rounded-3xl object-cover shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(37,99,235,0.4)' }}
        />
        <div className="mt-4 text-center">
          <p className="text-julius-text font-semibold text-lg">Julius</p>
          <p className="text-julius-muted text-sm mt-0.5">O teu agente financeiro pessoal</p>
        </div>
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-julius-card border border-julius-border flex items-center justify-center text-julius-muted hover:text-julius-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes julius-zoom-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
