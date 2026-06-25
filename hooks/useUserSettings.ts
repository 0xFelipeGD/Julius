'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { DEFAULT_CURRENCY } from '@/lib/utils/currency'
import { DEFAULT_TIMEZONE, getBrowserTimezone, isValidTimezone } from '@/lib/utils/timezone'

export function useUserSettings() {
  const store = useUserSettingsStore
  const { currency, timezone, avatarDataUrl, chatBackgroundDataUrl } = useUserSettingsStore()
  const supabase = createClient()

  const loadSettings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      store.getState().setLoaded(true)
      return
    }

    const detectedTimezone = getBrowserTimezone()
    const { data, error } = await supabase
      .from('user_settings')
      .select('currency, timezone, avatar_data_url, chat_background_data_url')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[Julius] loadSettings error:', error)
      store.getState().setCurrency(DEFAULT_CURRENCY)
      store.getState().setTimezone(detectedTimezone)
      store.getState().setLoaded(true)
      return
    }

    const savedTimezone = isValidTimezone(data?.timezone) ? data!.timezone : detectedTimezone

    store.getState().setCurrency(DEFAULT_CURRENCY)
    store.getState().setTimezone(savedTimezone)
    store.getState().setAvatarDataUrl(typeof data?.avatar_data_url === 'string' ? data.avatar_data_url : null)
    store.getState().setChatBackgroundDataUrl(typeof data?.chat_background_data_url === 'string' ? data.chat_background_data_url : null)
    store.getState().setLoaded(true)

    await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        currency: DEFAULT_CURRENCY,
        timezone: savedTimezone || DEFAULT_TIMEZONE,
      },
      { onConflict: 'user_id' }
    )
  }, [supabase, store])

  const saveTimezone = useCallback(async (value: string) => {
    const nextTimezone = isValidTimezone(value) ? value : DEFAULT_TIMEZONE
    store.getState().setTimezone(nextTimezone)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        currency: DEFAULT_CURRENCY,
        timezone: nextTimezone,
      },
      { onConflict: 'user_id' }
    )
  }, [supabase, store])

  const saveAvatarDataUrl = useCallback(async (value: string | null) => {
    store.getState().setAvatarDataUrl(value)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        currency: DEFAULT_CURRENCY,
        timezone: store.getState().timezone || DEFAULT_TIMEZONE,
        avatar_data_url: value,
      },
      { onConflict: 'user_id' }
    )
  }, [supabase, store])

  const saveChatBackgroundDataUrl = useCallback(async (value: string | null) => {
    store.getState().setChatBackgroundDataUrl(value)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_settings').upsert(
      {
        user_id: user.id,
        currency: DEFAULT_CURRENCY,
        timezone: store.getState().timezone || DEFAULT_TIMEZONE,
        chat_background_data_url: value,
      },
      { onConflict: 'user_id' }
    )
  }, [supabase, store])

  return {
    currency,
    timezone,
    avatarDataUrl,
    chatBackgroundDataUrl,
    loadSettings,
    saveTimezone,
    saveAvatarDataUrl,
    saveChatBackgroundDataUrl,
  }
}
