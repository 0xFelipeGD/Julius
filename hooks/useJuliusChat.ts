'use client'

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/appStore'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { useCategories } from '@/hooks/useCategories'
import { formatCurrency } from '@/lib/utils/currency'
import {
  getCurrentMonthKeyInTimezone,
  getCurrentMonthStartISO,
  getNextMonthBoundaryISO,
} from '@/lib/utils/timezone'
import type { Category, ChatMessage, JuliusChatResponse, TransacaoPendente } from '@/lib/types'

const LEGACY_PENDING_KEY = 'julius_pending_transaction'
const PENDING_PREFIX = 'julius_pending_transaction:'

interface ChatHistoryRow {
  id: string
  role: string
  content: string
  tipo: string
  created_at: string
}

function getPendingKey(userId: string, monthKey: string): string {
  return `${PENDING_PREFIX}${userId}:${monthKey}`
}

function clearLegacyPending() {
  try {
    localStorage.removeItem(LEGACY_PENDING_KEY)
  } catch {}
}

function savePending(key: string, transacao: TransacaoPendente) {
  try {
    localStorage.setItem(key, JSON.stringify(transacao))
  } catch {}
}

function loadPending(key: string): TransacaoPendente | null {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

function clearPending(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {}
}

function parseChatDate(value: string): string {
  const [day, month, year] = value.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function findCategory(categories: Category[], transacao: TransacaoPendente): Category {
  return (
    categories.find((category) => category.id === transacao.category_id) ??
    categories.find((category) => category.name.toLowerCase() === transacao.category_name?.toLowerCase()) ??
    categories.find((category) => category.legacy_tag === transacao.tag) ??
    categories.find((category) => category.is_fallback) ??
    categories[0]
  )
}

function isSamePendingTransaction(a: TransacaoPendente | undefined, b: TransacaoPendente): boolean {
  if (!a) return false

  return (
    Number(a.valor) === Number(b.valor) &&
    a.descricao === b.descricao &&
    a.dia === b.dia &&
    a.hora === b.hora
  )
}

export function useJuliusChat() {
  const { chatMessages, chatHistoryKey, setChatMessages, setChatHistoryKey, addChatMessage } = useAppStore()
  const { timezone } = useUserSettingsStore()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()

  const loadHistory = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const monthKey = getCurrentMonthKeyInTimezone(timezone)
    const historyKey = `${user.id}:${monthKey}`
    if (chatHistoryKey === historyKey && chatMessages.length > 0) return

    const now = new Date().toISOString()
    const monthStart = getCurrentMonthStartISO(timezone)
    await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', user.id)
      .or(`expires_at.lt.${now},created_at.lt.${monthStart}`)

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .gte('created_at', monthStart)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('[Julius] loadHistory error:', error)
      return
    }

    const loaded = ((data ?? []) as ChatHistoryRow[]).map((msg) => ({
      id: msg.id,
      role: msg.role as ChatMessage['role'],
      content: msg.content,
      tipo: msg.tipo as ChatMessage['tipo'],
      created_at: msg.created_at,
    }))

    clearLegacyPending()
    const pending = loadPending(getPendingKey(user.id, monthKey))
    if (pending) {
      const lastConfirmIdx = [...loaded].reverse().findIndex((message) => message.tipo === 'confirmacao')
      if (lastConfirmIdx >= 0) {
        const idx = loaded.length - 1 - lastConfirmIdx
        ;(loaded[idx] as ChatMessage).transacao_pendente = pending
      }
    }

    setChatMessages(loaded)
    setChatHistoryKey(historyKey)
  }, [supabase, chatMessages.length, chatHistoryKey, setChatHistoryKey, setChatMessages, timezone])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      tipo: 'texto',
      created_at: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    setIsLoading(true)

    try {
      let {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Session expired. Please log in again.')

      const nowSeconds = Math.floor(Date.now() / 1000)
      if (!session.expires_at || session.expires_at < nowSeconds + 60) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed.session) session = refreshed.session
      }

      const currentUserId = session.user.id
      const monthKey = getCurrentMonthKeyInTimezone(timezone)
      const expiresAt = getNextMonthBoundaryISO(timezone)

      await supabase.from('chat_history').insert({
        user_id: currentUserId,
        role: 'user',
        content: userMessage.content,
        tipo: userMessage.tipo,
        expires_at: expiresAt,
      })

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const currentMessages = useAppStore.getState().chatMessages
      const res = await fetch(`${supabaseUrl}/functions/v1/julius-chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: content,
          historico: currentMessages.slice(-10).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          timezone,
          categories: categories.map((category) => ({
            id: category.id,
            name: category.name,
            is_fallback: category.is_fallback,
          })),
        }),
      })

      if (!res.ok) {
        console.error('[Julius] Edge Function error:', res.status)
        throw new Error(`Julius returned ${res.status}`)
      }

      const data = (await res.json()) as JuliusChatResponse

      const juliusMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: data.mensagem_julius,
        tipo: data.tipo === 'registo' ? 'confirmacao' : 'texto',
        created_at: new Date().toISOString(),
        transacao_pendente: data.transacao,
      }

      if (data.transacao) savePending(getPendingKey(currentUserId, monthKey), data.transacao)

      addChatMessage(juliusMessage)

      await supabase.from('chat_history').insert({
        user_id: currentUserId,
        role: 'julius',
        content: data.mensagem_julius,
        tipo: juliusMessage.tipo,
        expires_at: expiresAt,
      })
    } catch (err) {
      console.error('[Julius] sendMessage error:', err)
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'julius',
        content: err instanceof Error ? err.message : 'Julius could not connect. Try again.',
        tipo: 'texto',
        created_at: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, addChatMessage, timezone, categories])

  const confirmTransaction = useCallback(async (transacao: TransacaoPendente): Promise<void> => {
    let {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) throw new Error('Session expired.')

    const nowSeconds = Math.floor(Date.now() / 1000)
    if (!session.expires_at || session.expires_at < nowSeconds + 60) {
      const { data: refreshed } = await supabase.auth.refreshSession()
      if (refreshed.session) session = refreshed.session
    }

    const diaISO = parseChatDate(transacao.dia)

    if (diaISO < '2025-01-01') {
      throw new Error('Julius only records data from 2025 onwards.')
    }

    const maxFuture = new Date()
    maxFuture.setFullYear(maxFuture.getFullYear() + 3)
    if (new Date(`${diaISO}T00:00:00`) > maxFuture) {
      throw new Error('Julius refuses to record expenses more than 3 years in advance.')
    }

    const category = findCategory(categories, transacao)
    if (!category) throw new Error('No category available for this transaction.')

    const { error } = await supabase.from('transacoes').insert({
      user_id: session.user.id,
      valor: transacao.valor,
      tag: category.legacy_tag ?? transacao.tag ?? 'Outros',
      category_id: category.id,
      descricao: transacao.descricao,
      dia: diaISO,
      hora: transacao.hora,
      source: 'chat',
    })

    if (error) throw error

    const monthKey = getCurrentMonthKeyInTimezone(timezone)
    clearPending(getPendingKey(session.user.id, monthKey))
    clearLegacyPending()
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })

    const confirmMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'julius',
      content: `Saved ${formatCurrency(transacao.valor)} for ${transacao.descricao}.`,
      tipo: 'texto',
      created_at: new Date().toISOString(),
    }

    const { error: historyError } = await supabase.from('chat_history').insert({
      user_id: session.user.id,
      role: confirmMsg.role,
      content: confirmMsg.content,
      tipo: confirmMsg.tipo,
      expires_at: getNextMonthBoundaryISO(timezone),
    })
    if (historyError) console.error('[Julius] confirm history error:', historyError)

    const currentMessages = useAppStore.getState().chatMessages
    const updated = currentMessages.map((message) =>
      isSamePendingTransaction(message.transacao_pendente, transacao)
        ? { ...message, transacao_pendente: undefined }
        : message
    )
    useAppStore.getState().setChatMessages([...updated, confirmMsg])
  }, [supabase, queryClient, categories, timezone])

  const clearConversation = useCallback(async (): Promise<void> => {
    setIsClearing(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Session expired. Please log in again.')

      const monthKey = getCurrentMonthKeyInTimezone(timezone)
      const monthStart = getCurrentMonthStartISO(timezone)
      const nextMonthStart = getNextMonthBoundaryISO(timezone)

      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .gte('created_at', monthStart)
        .lt('created_at', nextMonthStart)

      if (error) throw error

      clearPending(getPendingKey(user.id, monthKey))
      clearLegacyPending()
      setChatMessages([])
      setChatHistoryKey(`${user.id}:${monthKey}`)
    } finally {
      setIsClearing(false)
    }
  }, [supabase, setChatHistoryKey, setChatMessages, timezone])

  return {
    messages: chatMessages,
    isLoading,
    isClearing,
    sendMessage,
    confirmTransaction,
    clearConversation,
    loadHistory,
  }
}
