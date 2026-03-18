'use client'

import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
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

const CONFIRM_MESSAGES: Array<(desc: string, valor: number) => string> = [
  (desc, valor) => `Registado! ${desc} por ${valor.toFixed(2)}€. Cada cêntimo conta... literalmente.`,
  (desc, valor) => `Anotado com toda a dor do coração. ${desc}: ${valor.toFixed(2)}€ a menos na carteira.`,
  (desc, valor) => `Pronto, ${desc} guardado. ${valor.toFixed(2)}€... foi bonito enquanto durou.`,
  (desc, valor) => `Feito! ${desc} por ${valor.toFixed(2)}€. O teu saldo chora, o Julius anota.`,
  (desc, valor) => `${valor.toFixed(2)}€ em ${desc}. Guardado nos anais da tragédia financeira.`,
  (desc, valor) => `Registado! ${desc} — ${valor.toFixed(2)}€. Que Deus proteja a tua carteira.`,
  (desc, valor) => `Anotado! ${valor.toFixed(2)}€ em ${desc}. Continua assim e vamos viver numa caixa de papelão.`,
  (desc, valor) => `Ok, ${desc}: ${valor.toFixed(2)}€. A dívida com o futuro cresce.`,
  (desc, valor) => `${desc} registado: ${valor.toFixed(2)}€. O Julius suspira... mas anota sempre.`,
  (desc, valor) => `Gravado a ferro e fogo! ${desc}, ${valor.toFixed(2)}€. O dinheiro vai, o registo fica.`,
  (desc, valor) => `${valor.toFixed(2)}€?! Em ${desc}?! Deixa-me sentar que me deu uma tontura.`,
  (desc, valor) => `Registado. ${desc}, ${valor.toFixed(2)}€. Mais um prego no caixão da poupança.`,
  (desc, valor) => `${desc} por ${valor.toFixed(2)}€. Se o dinheiro chorasse, já tinhas uma inundação.`,
  (desc, valor) => `Anotado! ${valor.toFixed(2)}€ em ${desc}. Estou a ficar sem tinta de tanto registar gastos.`,
  (desc, valor) => `${valor.toFixed(2)}€... ${desc}... O Julius precisa de um momento.`,
  (desc, valor) => `Feito! ${desc}: ${valor.toFixed(2)}€. A carteira pediu-me para te dar um recado: "pára".`,
  (desc, valor) => `Registado com lágrimas nos olhos. ${desc}, ${valor.toFixed(2)}€. Era uma vez uma poupança...`,
  (desc, valor) => `${desc} guardado: ${valor.toFixed(2)}€. Sabes o que se comprava com isso nos meus tempos?`,
  (desc, valor) => `Ok, ${valor.toFixed(2)}€ em ${desc}. Vou acrescentar isto ao capítulo "Decisões Questionáveis".`,
  (desc, valor) => `Gravado! ${desc} — ${valor.toFixed(2)}€. O teu eu do futuro vai ter uma conversa séria contigo.`,
  (desc, valor) => `${valor.toFixed(2)}€ registados. ${desc}. O Julius perdoa, mas o saldo bancário não.`,
  (desc, valor) => `Anotado. ${desc}, ${valor.toFixed(2)}€. Cada vez que registo um gasto, perco um cabelo.`,
  (desc, valor) => `${desc}: ${valor.toFixed(2)}€. Pronto, está registado. Agora vou ali chorar um bocadinho.`,
  (desc, valor) => `Feito! ${valor.toFixed(2)}€ em ${desc}. A conta bancária mandou cumprimentos... e um pedido de socorro.`,
  (desc, valor) => `Registado com profunda consternação. ${desc}, ${valor.toFixed(2)}€. Fico à espera do milagre.`,
]

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

      setMessages(loaded)
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

      // Persistir pendente em localStorage para sobreviver a navegação
      if (response.transacao) {
        savePending(response.transacao)
      }

      setMessages((prev) => [...prev, juliusMessage])

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

    const randomMsg = CONFIRM_MESSAGES[Math.floor(Math.random() * CONFIRM_MESSAGES.length)]
    const confirmMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'julius',
      content: randomMsg(transacao.descricao, transacao.valor),
      tipo: 'texto',
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => {
      const updated = prev.map((m) =>
        m.transacao_pendente === transacao
          ? { ...m, transacao_pendente: undefined }
          : m
      )
      return [...updated, confirmMsg]
    })
  }, [supabase, queryClient])

  return { messages, isLoading, sendMessage, confirmTransaction, loadHistory }
}
