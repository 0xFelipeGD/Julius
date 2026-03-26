import type { ChatMessage } from '@/lib/types'
import { TransactionConfirm } from './TransactionConfirm'
import type { TransacaoPendente } from '@/lib/types'
import { useTranslation } from '@/lib/i18n'
import { useUserSettingsStore } from '@/stores/userSettingsStore'
import { getRegionConfig } from '@/lib/config/regions'
import { getPersona, getPersonaImage } from '@/lib/prompts'

interface ChatBubbleProps {
  message: ChatMessage
  onConfirm?: (t: TransacaoPendente) => Promise<void> | void
  onCorrect?: (t: TransacaoPendente, correction: string) => void
}

export function ChatBubble({ message, onConfirm, onCorrect }: ChatBubbleProps) {
  const t = useTranslation()
  const { region, persona } = useUserSettingsStore()
  const personaConfig = getPersona(persona)
  const personaImage = getPersonaImage(personaConfig.id)
  const dateLocale = region ? getRegionConfig(region).dateLocale : 'pt-PT'
  const isUser = message.role === 'user'
  const time = new Date(message.created_at).toLocaleTimeString(dateLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <img src={personaImage} alt={personaConfig.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/personas/julius.png' }} />
        </div>
      )}
      <div className={`max-w-[80%]`}>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'rounded-br-md bg-julius-accent text-white'
              : 'rounded-bl-md bg-julius-card text-julius-text'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content || t.chat.fallbackError}
          </p>
        </div>
        {message.transacao_pendente && onConfirm && onCorrect && (
          <div className="mt-2">
            <TransactionConfirm
              transacao={message.transacao_pendente}
              onConfirm={onConfirm}
              onCorrect={onCorrect}
            />
          </div>
        )}
        <p className={`mt-1 text-xs text-julius-muted ${isUser ? 'text-right' : 'text-left'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
