'use client'

import { useEffect, useRef } from 'react'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { CameraCapture, type CameraCaptureRef } from '@/components/chat/CameraCapture'
import { useJuliusChat } from '@/hooks/useJuliusChat'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { formatCurrency } from '@/lib/utils/currency'
import { getPersona, getPersonaImage } from '@/lib/prompts'
import type { TransacaoPendente, RegionCode } from '@/lib/types'

export default function ChatPage() {
  const { messages, isLoading, sendMessage, confirmTransaction, loadHistory } = useJuliusChat()
  const { currency, region, persona } = useUserSettingsStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<CameraCaptureRef>(null)

  const personaConfig = getPersona(persona)
  const regionCode = (region ?? 'PT') as RegionCode
  const emptyGreeting = personaConfig.getEmptyGreeting(regionCode)

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
    sendMessage(`Correção: ${correction}. Dados originais: ${t.descricao}, ${formatCurrency(t.valor, currency)}, ${t.tag}`)
  }

  function handleCamera() {
    cameraRef.current?.open()
  }

  function handleCapture(base64: string) {
    sendMessage('', base64)
  }

  const personaImage = getPersonaImage(personaConfig.id)

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 h-16 w-16 overflow-hidden rounded-full">
              <img src={personaImage} alt={personaConfig.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/personas/julius.png' }} />
            </div>
            <p className="text-julius-text font-medium">{emptyGreeting.title}</p>
            <p className="mt-1 text-sm text-julius-muted">
              {emptyGreeting.subtitle}
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
            <div className="mr-2 h-8 w-8 shrink-0 overflow-hidden rounded-full">
              <img src={personaImage} alt={personaConfig.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/personas/julius.png' }} />
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
