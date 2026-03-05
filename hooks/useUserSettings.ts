'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { ALL_TAGS } from '@/lib/categories'
import type { Currency, Tag } from '@/lib/types'

export function useUserSettings() {
  const { currency, enabledCategories, setCurrency, setEnabledCategories, setLoaded } =
    useUserSettingsStore()
  const supabase = createClient()

  const loadSettings = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_settings')
      .select('currency, enabled_categories')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setCurrency((data.currency as Currency) ?? 'EUR')
      setEnabledCategories((data.enabled_categories as Tag[]) ?? ALL_TAGS)
    }
    setLoaded(true)
  }, [supabase, setCurrency, setEnabledCategories, setLoaded])

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

  const saveEnabledCategories = useCallback(
    async (cats: Tag[]) => {
      setEnabledCategories(cats)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, enabled_categories: cats }, { onConflict: 'user_id' })
    },
    [supabase, setEnabledCategories]
  )

  return { currency, enabledCategories, loadSettings, saveCurrency, saveEnabledCategories }
}
