'use client'

import { useEffect } from 'react'
import { captureInstallPrompt } from '@/hooks/useInstallPrompt'
import { IOSInstallHint } from '@/components/IOSInstallHint'

export function InstallPromptProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = captureInstallPrompt()
    return cleanup
  }, [])

  return (
    <>
      {children}
      <IOSInstallHint />
    </>
  )
}
