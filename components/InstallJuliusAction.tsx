'use client'

import { Download, MonitorDown, X } from 'lucide-react'
import { useState } from 'react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'
import { useTranslation } from '@/lib/i18n'

interface InstallJuliusActionProps {
  variant?: 'button' | 'row'
}

export function InstallJuliusAction({ variant = 'button' }: InstallJuliusActionProps) {
  const t = useTranslation()
  const { canInstall, installed, install } = useInstallPrompt()
  const [showGuide, setShowGuide] = useState(false)

  async function handleInstallClick() {
    if (canInstall) {
      await install()
    } else {
      setShowGuide(true)
    }
  }

  if (installed) return null

  const action =
    variant === 'row' ? (
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex w-full items-center gap-3 rounded-2xl bg-julius-raised px-3 py-3 text-left transition hover:bg-julius-accent-soft/55 active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-julius-accent-soft text-julius-accent">
          <MonitorDown className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-julius-text">{t.install.title}</span>
          <span className="mt-0.5 block text-xs leading-snug text-julius-muted">{t.install.settingsHint}</span>
        </span>
        <Download className="h-4 w-4 shrink-0 text-julius-muted" />
      </button>
    ) : (
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-julius-border bg-julius-raised py-3 text-sm font-medium text-julius-muted transition hover:text-julius-text active:scale-[0.98]"
      >
        <Download className="h-4 w-4" />
        {t.login.installButton}
      </button>
    )

  return (
    <>
      {action}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(38,29,52,0.42)] px-4 pb-8"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-[24px] border border-julius-border bg-julius-card p-5 shadow-[0_20px_60px_rgba(56,42,77,0.22)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-julius-text">{t.install.title}</h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="text-julius-muted transition hover:text-julius-text"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-julius-muted">
              {[t.install.chromeStep1, t.install.chromeStep2, t.install.chromeStep3].map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-julius-accent text-[11px] font-bold text-julius-on-accent">
                    {index + 1}
                  </span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-julius-accent py-2.5 text-sm font-semibold text-julius-on-accent"
            >
              {t.install.understood}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
