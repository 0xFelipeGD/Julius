import { create } from 'zustand'
import { ALL_TAGS } from '@/lib/categories'
import type { Currency, Tag, Limites } from '@/lib/types'

interface UserSettingsState {
  currency: Currency
  enabledCategories: Tag[]
  limites: Limites
  loaded: boolean
  setCurrency: (c: Currency) => void
  setEnabledCategories: (cats: Tag[]) => void
  setLimites: (l: Limites) => void
  setLoaded: (v: boolean) => void
}

export const useUserSettingsStore = create<UserSettingsState>((set) => ({
  currency: 'EUR',
  enabledCategories: ALL_TAGS,
  limites: {},
  loaded: false,
  setCurrency: (currency) => set({ currency }),
  setEnabledCategories: (enabledCategories) => set({ enabledCategories }),
  setLimites: (limites) => set({ limites }),
  setLoaded: (loaded) => set({ loaded }),
}))
