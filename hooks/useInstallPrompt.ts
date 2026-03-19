'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Module-level storage so the prompt survives component unmounts/remounts
// and is shared across all hook instances (login page + AppShell)
let _deferredPrompt: BeforeInstallPromptEvent | null = null
const _listeners = new Set<() => void>()

function notifyListeners() {
  _listeners.forEach((fn) => fn())
}

export function captureInstallPrompt() {
  if (typeof window === 'undefined') return

  const handler = (e: Event) => {
    e.preventDefault()
    _deferredPrompt = e as BeforeInstallPromptEvent
    notifyListeners()
  }

  window.addEventListener('beforeinstallprompt', handler)
  // Return cleanup (call in AppShell's useEffect return)
  return () => window.removeEventListener('beforeinstallprompt', handler)
}

export function useInstallPrompt() {
  const [, rerender] = useState(0)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Subscribe to prompt updates
    const onUpdate = () => rerender((n) => n + 1)
    _listeners.add(onUpdate)

    const installedHandler = () => {
      setInstalled(true)
      _listeners.delete(onUpdate)
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      _listeners.delete(onUpdate)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  async function install() {
    if (!_deferredPrompt) return
    _deferredPrompt.prompt()
    const { outcome } = await _deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    _deferredPrompt = null
    notifyListeners()
  }

  return {
    canInstall: !!_deferredPrompt && !installed,
    installed,
    install,
  }
}
