'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

const IOS_HINT_KEY = 'julius_ios_hint_dismissed'

export function IOSInstallHint() {
  const t = useTranslation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem(IOS_HINT_KEY)

    if (isIOS && !isStandalone && !dismissed) {
      setShow(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(IOS_HINT_KEY, '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-xl border border-julius-border bg-julius-card p-4 shadow-lg">
      <p className="text-sm font-medium text-julius-text mb-1">{t.install.title}</p>
      <p className="text-xs text-julius-muted">{t.install.iosHint}</p>
      <button onClick={dismiss} className="mt-2 text-xs text-julius-accent">
        {t.install.dismiss}
      </button>
    </div>
  )
}
