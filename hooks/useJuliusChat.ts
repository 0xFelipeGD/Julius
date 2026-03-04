'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage, JuliusChatResponse, TransacaoPendente } from '@/lib/types'
import { useAuthStore } from '@/stores/authStore'

export function useJuliusChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const userId = useAuthStore((s) => s.userId)
  const supabase = createClient()

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)

    if (data) {
      setMessages((data as Array<{ id: string; role: string; content: string; tipo: string; created_at: string }>).map((msg) => ({
        id: msg.id,
        role: msg.role as ChatMessage['role'],
        content: msg.content,
        tipo: msg.tipo as ChatMessage['tipo'],
        created_at: msg.created_at,
      })))
    }
  }, [supabase])

  const sendMessage = useCallback(async (content: string, imageBase64?: string) => {
    if (!content.trim() && !imageBase64) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: imageBase64 ? '📷 Foto enviada' : content,
      tipo: imageBase64 ? 'imagem' : 'texto',
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Save user message to history
      await supabase.from('chat_history').insert({
        user_id: userId,
        role: 'user',
        content: userMessage.content,
        tipo: userMessage.tipo,
      })

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('julius-chat', {
        body: {
          mensagem: content,
          imagem_base64: imageBase64,
          historico: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      })

      if (error || !data) {
        console.error('[Julius] Edge Function error:', error)
        throw new Error(error?.message ?? 'Edge Function julius-chat não encontrada ou sem resposta.')
      }

      const response = data as JuliusChatResponse

      const juliusMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: response.mensagem_julius,
        tipo: response.tipo === 'registo' ? 'confirmacao' : 'texto',
        created_at: new Date().toISOString(),
        transacao_pendente: response.transacao,
      }

      setMessages((prev) => [...prev, juliusMessage])

      // Save julius message to history
      await supabase.from('chat_history').insert({
        user_id: userId,
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
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, supabase, userId])

  const confirmTransaction = useCallback(async (transacao: TransacaoPendente) => {
    try {
      const { error } = await supabase.from('transacoes').insert({
        user_id: userId,
        valor: transacao.valor,
        tag: transacao.tag,
        descricao: transacao.descricao,
        dia: transacao.dia,
        hora: transacao.hora,
      })

      if (error) throw error

      const confirmMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: `Registado! ${transacao.descricao} por ${transacao.valor.toFixed(2)}€. Cada cêntimo conta... literalmente.`,
        tipo: 'texto',
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => {
        // Remove the pending transaction from the message that had it
        const updated = prev.map((m) =>
          m.transacao_pendente === transacao
            ? { ...m, transacao_pendente: undefined }
            : m
        )
        return [...updated, confirmMsg]
      })
    } catch {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: 'Não consegui gravar. O dinheiro escapou-me das mãos digitais...',
        tipo: 'texto',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
    }
  }, [supabase, userId])

  return { messages, isLoading, sendMessage, confirmTransaction, loadHistory }
}
