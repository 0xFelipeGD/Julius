'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage, JuliusChatResponse, TransacaoPendente } from '@/lib/types'

export function useJuliusChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const queryClient = useQueryClient()

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
      // Get fresh session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada. Faz login novamente.')

      const currentUserId = session.user.id

      // Save user message to history
      await supabase.from('chat_history').insert({
        user_id: currentUserId,
        role: 'user',
        content: userMessage.content,
        tipo: userMessage.tipo,
      })

      // Call Edge Function via fetch directo para garantir JWT no Authorization header
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
          historico: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
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

      setMessages((prev) => [...prev, juliusMessage])

      // Save julius message to history
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
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, supabase])

  const confirmTransaction = useCallback(async (transacao: TransacaoPendente) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada.')

      // Convert dia from DD/MM/YYYY to YYYY-MM-DD for Supabase
      const [day, month, year] = transacao.dia.split('/')
      const diaISO = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

      const { error } = await supabase.from('transacoes').insert({
        user_id: session.user.id,
        valor: transacao.valor,
        tag: transacao.tag,
        descricao: transacao.descricao,
        dia: diaISO,
        hora: transacao.hora,
      })

      if (error) throw error

      // Atualiza dashboard e extrato sem precisar recarregar
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })

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
    } catch (err) {
      console.error('[Julius] confirmTransaction error:', err)
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'julius',
        content: 'Não consegui gravar. O dinheiro escapou-me das mãos digitais...',
        tipo: 'texto',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
    }
  }, [supabase])

  return { messages, isLoading, sendMessage, confirmTransaction, loadHistory }
}
