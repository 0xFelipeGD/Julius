import { create } from 'zustand'
import { ALL_TAGS } from '@/lib/categories'
import type { Currency, Tag } from '@/lib/types'

interface UserSettingsState {
  currency: Currency
  enabledCategories: Tag[]
  loaded: boolean
  setCurrency: (c: Currency) => void
  setEnabledCategories: (cats: Tag[]) => void
  setLoaded: (v: boolean) => void
}

export const useUserSettingsStore = create<UserSettingsState>((set) => ({
  currency: 'EUR',
  enabledCategories: ALL_TAGS,
  loaded: false,
  setCurrency: (currency) => set({ currency }),
  setEnabledCategories: (enabledCategories) => set({ enabledCategories }),
  setLoaded: (loaded) => set({ loaded }),
}))
