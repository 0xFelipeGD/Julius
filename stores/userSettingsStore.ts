import { create } from 'zustand'
import type { Currency } from '@/lib/types'
import { DEFAULT_CURRENCY } from '@/lib/utils/currency'
import { DEFAULT_TIMEZONE, getBrowserTimezone } from '@/lib/utils/timezone'

interface UserSettingsState {
  currency: Currency
  timezone: string
  avatarDataUrl: string | null
  chatBackgroundDataUrl: string | null
  loaded: boolean

  setCurrency: (currency: Currency) => void
  setTimezone: (timezone: string) => void
  setAvatarDataUrl: (avatarDataUrl: string | null) => void
  setChatBackgroundDataUrl: (chatBackgroundDataUrl: string | null) => void
  setLoaded: (loaded: boolean) => void
}

function getInitialTimezone(): string {
  if (typeof window === 'undefined') return DEFAULT_TIMEZONE
  return localStorage.getItem('julius_timezone') || getBrowserTimezone()
}

export const useUserSettingsStore = create<UserSettingsState>((set) => ({
  currency: DEFAULT_CURRENCY,
  timezone: getInitialTimezone(),
  avatarDataUrl: null,
  chatBackgroundDataUrl: null,
  loaded: false,

  setCurrency: (currency) => set({ currency }),
  setTimezone: (timezone) => {
    if (typeof window !== 'undefined') localStorage.setItem('julius_timezone', timezone)
    set({ timezone })
  },
  setAvatarDataUrl: (avatarDataUrl) => set({ avatarDataUrl }),
  setChatBackgroundDataUrl: (chatBackgroundDataUrl) => set({ chatBackgroundDataUrl }),
  setLoaded: (loaded) => set({ loaded }),
}))
