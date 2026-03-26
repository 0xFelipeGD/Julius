import { create } from 'zustand'
import { ALL_TAGS } from '@/lib/categories'
import type { Currency, Tag, Limites, RegionCode } from '@/lib/types'

interface UserSettingsState {
  region: RegionCode | null
  currency: Currency
  enabledCategories: Tag[]
  limites: Limites
  persona: string | null
  receiptPhotosEnabled: boolean
  loaded: boolean

  setRegion: (r: RegionCode) => void
  setCurrency: (c: Currency) => void
  setEnabledCategories: (cats: Tag[]) => void
  setLimites: (l: Limites) => void
  setPersona: (p: string | null) => void
  setReceiptPhotosEnabled: (v: boolean) => void
  setLoaded: (v: boolean) => void
}

export const useUserSettingsStore = create<UserSettingsState>((set) => ({
  region: null,
  currency: 'EUR',
  enabledCategories: ALL_TAGS,
  limites: {},
  persona: null,
  receiptPhotosEnabled: false,
  loaded: false,

  setRegion: (region) => set({ region }),
  setCurrency: (currency) => set({ currency }),
  setEnabledCategories: (enabledCategories) => set({ enabledCategories }),
  setLimites: (limites) => set({ limites }),
  setPersona: (persona) => set({ persona }),
  setReceiptPhotosEnabled: (receiptPhotosEnabled) => set({ receiptPhotosEnabled }),
  setLoaded: (loaded) => set({ loaded }),
}))
