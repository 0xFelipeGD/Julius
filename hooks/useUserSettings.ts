'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { ALL_TAGS } from '@/lib/categories'
import type { Currency, Tag, Limites } from '@/lib/types'

export function useUserSettings() {
  const { currency, enabledCategories, limites, setCurrency, setEnabledCategories, setLimites, setLoaded } =
    useUserSettingsStore()
  const supabase = createClient()

  const loadSettings = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_settings')
      .select('currency, enabled_categories, limites')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setCurrency((data.currency as Currency) ?? 'EUR')
      setEnabledCategories((data.enabled_categories as Tag[]) ?? ALL_TAGS)
      setLimites((data.limites as Limites) ?? {})
    }
    setLoaded(true)
  }, [supabase, setCurrency, setEnabledCategories, setLimites, setLoaded])

  const saveCurrency = useCallback(
    async (value: Currency) => {
      setCurrency(value)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, currency: value }, { onConflict: 'user_id' })
    },
    [supabase, setCurrency]
  )

  const saveLimites = useCallback(
    async (value: Limites) => {
      setLimites(value)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, limites: value }, { onConflict: 'user_id' })
    },
    [supabase, setLimites]
  )

  return { currency, enabledCategories, limites, loadSettings, saveCurrency, saveLimites }
}
