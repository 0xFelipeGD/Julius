'use client'

import { useState } from 'react'
import { TutorialModal } from '@/components/TutorialModal'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useTranslation } from '@/lib/i18n'

export function HelpSection() {
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const { canInstall, installed, install } = useInstallPrompt()
  const t = useTranslation()

  function handleInstallClick() {
    if (canInstall) {
      install()
    } else {
      setShowInstallGuide(true)
    }
  }

  return (
    <>
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-julius-muted mb-3">{t.settings.helpTitle}</h2>
        <div className="rounded-xl bg-julius-card border border-julius-border overflow-hidden divide-y divide-julius-border">
          <button
            onClick={() => setTutorialOpen(true)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-julius-text hover:bg-julius-bg transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-base">📖</span>
              {t.settings.tutorial}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-julius-muted">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {!installed && (
            <button
              onClick={handleInstallClick}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-julius-text hover:bg-julius-bg transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-julius-muted">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t.settings.installApp}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-julius-muted">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}
        </div>
      </section>

      <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />

      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-8" onClick={() => setShowInstallGuide(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-julius-card border border-julius-border p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-julius-text">{t.install.title}</h3>
              <button onClick={() => setShowInstallGuide(false)} className="text-julius-muted hover:text-julius-text">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm text-julius-muted">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-julius-accent text-[11px] font-bold text-white">1</span>
                <p dangerouslySetInnerHTML={{ __html: t.install.chromeStep1 }} />
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-julius-accent text-[11px] font-bold text-white">2</span>
                <p dangerouslySetInnerHTML={{ __html: t.install.chromeStep2 }} />
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-julius-accent text-[11px] font-bold text-white">3</span>
                <p dangerouslySetInnerHTML={{ __html: t.install.chromeStep3 }} />
              </div>
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="mt-5 w-full rounded-xl bg-julius-accent py-2.5 text-sm font-semibold text-white"
            >
              {t.install.understood}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
