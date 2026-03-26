'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/appStore'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { formatCurrency } from '@/lib/utils/currency'
import { getPersona } from '@/lib/prompts'
import type { ChatMessage, JuliusChatResponse, TransacaoPendente } from '@/lib/types'

const PENDING_KEY = 'julius_pending_transaction'

function savePending(transacao: TransacaoPendente) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(transacao)) } catch {}
}
function loadPending(): TransacaoPendente | null {
  try { const v = localStorage.getItem(PENDING_KEY); return v ? JSON.parse(v) : null } catch { return null }
}
function clearPending() {
  try { localStorage.removeItem(PENDING_KEY) } catch {}
}

export function useJuliusChat() {
  const { chatMessages, setChatMessages, addChatMessage } = useAppStore()
  const { currency, region, persona } = useUserSettingsStore()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()

  const loadHistory = useCallback(async () => {
    // Only fetch from Supabase if messages are not yet loaded
    if (chatMessages.length > 0) return

    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)

    if (data) {
      const loaded = (data as Array<{ id: string; role: string; content: string; tipo: string; created_at: string }>).map((msg) => ({
        id: msg.id,
        role: msg.role as ChatMessage['role'],
        content: msg.content,
        tipo: msg.tipo as ChatMessage['tipo'],
        created_at: msg.created_at,
      }))

      // Reanexar transação pendente ao último mensaje de confirmação (sobrevive a navegação)
      const pending = loadPending()
      if (pending) {
        const lastConfirmIdx = [...loaded].reverse().findIndex((m) => m.tipo === 'confirmacao')
        if (lastConfirmIdx >= 0) {
          const idx = loaded.length - 1 - lastConfirmIdx
          ;(loaded[idx] as ChatMessage).transacao_pendente = pending
        }
      }

      setChatMessages(loaded)
    }
  }, [supabase, chatMessages.length, setChatMessages])

  const sendMessage = useCallback(async (content: string, imageBase64?: string) => {
    if (!content.trim() && !imageBase64) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: imageBase64 ? '📷 Foto enviada' : content,
      tipo: imageBase64 ? 'imagem' : 'texto',
      created_at: new Date().toISOString(),
    }

    addChatMessage(userMessage)
    setIsLoading(true)

    try {
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faz login novamente.')

      // Mobile browsers suspend JS in background — auto-refresh may not fire.
      // Force refresh if token is expired or expiring in the next 60s.
      const now = Math.floor(Date.now() / 1000)
      if (!session.expires_at || session.expires_at < now + 60) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        if (refreshed.session) session = refreshed.session
      }

      const currentUserId = session.user.id

      await supabase.from('chat_history').insert({
        user_id: currentUserId,
        role: 'user',
        content: userMessage.content,
        tipo: userMessage.tipo,
      })

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const currentMessages = useAppStore.getState().chatMessages
      const res = await fetch(`${supabaseUrl}/functions/v1/julius-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: content,
          imagem_base64: imageBase64,
          historico: currentMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          region: region ?? 'PT',
          persona_id: persona ?? 'julius',
        }),
      })

      if (!res.ok) {
        console.error('[Julius] Edge Function error:', res.status)
        throw new Error(`Edge Function retornou ${res.status}`)
      }

      const data = await res.json()
      const response = data as JuliusChatResponse

      const juliusMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: response.mensagem_julius,
        tipo: response.tipo === 'registo' ? 'confirmacao' : 'texto',
        created_at: new Date().toISOString(),
        transacao_pendente: response.transacao,
      }

      // Persistir pendente em localStorage para sobreviver a navegação
      if (response.transacao) {
        savePending(response.transacao)
      }

      addChatMessage(juliusMessage)

      await supabase.from('chat_history').insert({
        user_id: currentUserId,
        role: 'julius',
        content: data.mensagem_julius,
        tipo: juliusMessage.tipo,
      })
    } catch (err) {
      console.error('[Julius] sendMessage error:', err)
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: err instanceof Error ? err.message : 'Sem internet? Até eu precisaria de poupar nisto.',
        tipo: 'texto',
        created_at: new Date().toISOString(),
      }
      addChatMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [supabase, region, persona, addChatMessage])

  const confirmTransaction = useCallback(async (transacao: TransacaoPendente): Promise<void> => {
    let { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Sessão expirada.')

    const now = Math.floor(Date.now() / 1000)
    if (!session.expires_at || session.expires_at < now + 60) {
      const { data: refreshed } = await supabase.auth.refreshSession()
      if (refreshed.session) session = refreshed.session
    }

    const [day, month, year] = transacao.dia.split('/')
    const diaISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    // Validar: não antes de 2025
    if (diaISO < '2025-01-01') {
      throw new Error('O Julius só trabalha com dados a partir de 2025. O passado antes disso? Esquece!')
    }

    // Validar: máximo 3 anos no futuro
    const maxFuture = new Date()
    maxFuture.setFullYear(maxFuture.getFullYear() + 3)
    if (new Date(diaISO) > maxFuture) {
      throw new Error('O Julius recusa-se a registar gastos com mais de 3 anos de antecedência. Ele é agente financeiro, não vidente!')
    }

    const { error } = await supabase.from('transacoes').insert({
      user_id: session.user.id,
      valor: transacao.valor,
      tag: transacao.tag,
      descricao: transacao.descricao,
      dia: diaISO,
      hora: transacao.hora,
    })

    if (error) throw error

    clearPending()
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['stats'] })

    // Use persona confirm messages
    const personaConfig = getPersona(persona)
    const regionCode = (region ?? 'PT') as import('@/lib/types').RegionCode
    const confirmMessages = personaConfig.getConfirmMessages(regionCode)
    const randomMsg = confirmMessages[Math.floor(Math.random() * confirmMessages.length)]
    const fmt = (v: number) => formatCurrency(v, currency)
    const confirmMsgContent = randomMsg(transacao.descricao, transacao.valor, fmt)

    const confirmMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'julius',
      content: confirmMsgContent,
      tipo: 'texto',
      created_at: new Date().toISOString(),
    }

    const currentMessages = useAppStore.getState().chatMessages
    const updated = currentMessages.map((m) =>
      m.transacao_pendente === transacao
        ? { ...m, transacao_pendente: undefined }
        : m
    )
    useAppStore.getState().setChatMessages([...updated, confirmMsg])
  }, [supabase, queryClient, currency, region, persona])

  return { messages: chatMessages, isLoading, sendMessage, confirmTransaction, loadHistory }
}
