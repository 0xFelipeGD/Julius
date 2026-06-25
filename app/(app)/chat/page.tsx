'use client'

import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { useJuliusChat } from '@/hooks/useJuliusChat'
import { formatCurrency } from '@/lib/utils/currency'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import type { TransacaoPendente } from '@/lib/types'

export default function ChatPage() {
  const { messages, isLoading, sendMessage, confirmTransaction, loadHistory } = useJuliusChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatBackgroundDataUrl = useUserSettingsStore((state) => state.chatBackgroundDataUrl)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleConfirm(t: TransacaoPendente) {
    try {
      await confirmTransaction(t)
    } catch (err) {
      console.error('[Julius] confirmTransaction error:', err)
    }
  }

  function handleCorrect(t: TransacaoPendente, correction: string) {
    const category = t.category_name ?? t.tag ?? 'Other'
    sendMessage(`Correction: ${correction}. Original data: ${t.descricao}, ${formatCurrency(t.valor)}, ${category}`)
  }

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-julius-bg"
      style={
        chatBackgroundDataUrl
          ? {
              backgroundImage: `url(${chatBackgroundDataUrl})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }
          : undefined
      }
    >
      {chatBackgroundDataUrl && (
        <div className="pointer-events-none absolute inset-0 bg-[oklch(0.965_0.012_305_/_0.78)]" />
      )}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col justify-end pb-10">
            <div className="rounded-[22px] bg-julius-card p-5 shadow-[0_18px_42px_rgba(56,42,77,0.10)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-julius-accent-soft text-julius-accent">
                  <Bot className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-base font-semibold text-julius-text">Hello, I am Julius.</p>
                  <p className="text-sm text-julius-muted">Tell me what you spent.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-julius-muted">
                <p className="rounded-xl bg-julius-raised px-3 py-2">Paid €12 for lunch</p>
                <p className="rounded-xl bg-julius-raised px-3 py-2">Gym €30 yesterday</p>
                <p className="rounded-xl bg-julius-raised px-3 py-2">Groceries €45 last Friday</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            onConfirm={handleConfirm}
            onCorrect={handleCorrect}
          />
        ))}

        {isLoading && (
          <div className="mb-3 flex justify-start">
            <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-julius-accent-soft text-julius-accent">
              <Bot className="h-4 w-4" strokeWidth={1.9} />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-julius-card px-4 py-3 shadow-[0_10px_28px_rgba(56,42,77,0.08)]">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-julius-muted [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-julius-muted [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-julius-muted [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
