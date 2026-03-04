'use client'

import { useEffect, useRef } from 'react'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { CameraCapture, type CameraCaptureRef } from '@/components/chat/CameraCapture'
import { useJuliusChat } from '@/hooks/useJuliusChat'
import type { TransacaoPendente } from '@/lib/types'

export default function ChatPage() {
  const { messages, isLoading, sendMessage, confirmTransaction, loadHistory } = useJuliusChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<CameraCaptureRef>(null)

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function handleConfirm(t: TransacaoPendente) {
    confirmTransaction(t)
  }

  function handleCorrect(t: TransacaoPendente, correction: string) {
    sendMessage(`Correção: ${correction}. Dados originais: ${t.descricao}, ${t.valor}€, ${t.tag}`)
  }

  function handleCamera() {
    cameraRef.current?.open()
  }

  function handleCapture(base64: string) {
    sendMessage('', base64)
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-julius-accent">
              <span className="text-2xl font-bold text-white">J</span>
            </div>
            <p className="text-julius-text font-medium">Olá! Sou o Julius.</p>
            <p className="mt-1 text-sm text-julius-muted">
              Conta-me o que gastaste hoje. Ou tira uma foto ao recibo.
            </p>
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
          <div className="flex justify-start mb-3">
            <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-julius-accent">
              <span className="text-xs font-bold text-white">J</span>
            </div>
            <div className="rounded-2xl rounded-bl-md bg-julius-card px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-julius-muted [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-julius-muted [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-julius-muted [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <CameraCapture ref={cameraRef} onCapture={handleCapture} />
      <ChatInput onSend={sendMessage} onCamera={handleCamera} disabled={isLoading} />
    </div>
  )
}
