'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { ALL_TAGS } from '@/lib/categories'
import { currencyForRegion } from '@/lib/config/regions'
import type { Currency, Tag, Limites, RegionCode } from '@/lib/types'
import { getPersonasForRegion } from '@/lib/prompts'

export function useUserSettings() {
  const store = useUserSettingsStore
  const { currency, enabledCategories, limites } = useUserSettingsStore()
  const supabase = createClient()

  const loadSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_settings')
      .select('currency, enabled_categories, limites, region, persona, receipt_photos_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (data) {
      const region = (data.region as RegionCode) ?? null
      const derivedCurrency = region ? currencyForRegion(region) : (data.currency as Currency) ?? 'EUR'

      store.getState().setRegion(region)
      if (region) localStorage.setItem('julius_region', region)
      store.getState().setCurrency(derivedCurrency)
      store.getState().setEnabledCategories((data.enabled_categories as Tag[]) ?? ALL_TAGS)
      store.getState().setLimites((data.limites as Limites) ?? {})
      store.getState().setPersona(data.persona ?? null)
      store.getState().setReceiptPhotosEnabled(data.receipt_photos_enabled ?? false)
    }
    store.getState().setLoaded(true)
  }, [supabase, store])

  const saveRegion = useCallback(async (region: RegionCode) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newCurrency = currencyForRegion(region)
    const firstPersona = getPersonasForRegion(region)[0]
    const firstPersonaId = firstPersona?.id ?? null

    store.getState().setRegion(region)
    localStorage.setItem('julius_region', region)
    store.getState().setCurrency(newCurrency)
    store.getState().setPersona(firstPersonaId)

    await supabase.from('user_settings').upsert(
      { user_id: user.id, region, currency: newCurrency, persona: firstPersonaId },
      { onConflict: 'user_id' }
    )
  }, [supabase, store])

  const savePersona = useCallback(async (persona: string | null) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    store.getState().setPersona(persona)
    await supabase.from('user_settings').upsert({ user_id: user.id, persona }, { onConflict: 'user_id' })
  }, [supabase, store])

  const saveReceiptPhotosEnabled = useCallback(async (enabled: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    store.getState().setReceiptPhotosEnabled(enabled)
    await supabase.from('user_settings').upsert({ user_id: user.id, receipt_photos_enabled: enabled }, { onConflict: 'user_id' })
  }, [supabase, store])

  const saveLimites = useCallback(async (value: Limites) => {
    store.getState().setLimites(value)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: user.id, limites: value, currency, enabled_categories: enabledCategories },
        { onConflict: 'user_id' }
      )
    if (error) console.error('saveLimites error:', error)
  }, [supabase, store, currency, enabledCategories])

  return {
    currency,
    enabledCategories,
    limites,
    loadSettings,
    saveRegion,
    savePersona,
    saveReceiptPhotosEnabled,
    saveLimites,
  }
}
