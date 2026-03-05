import type { ChatMessage } from '@/lib/types'
import { TransactionConfirm } from './TransactionConfirm'
import type { TransacaoPendente } from '@/lib/types'

interface ChatBubbleProps {
  message: ChatMessage
  onConfirm?: (t: TransacaoPendente) => Promise<void> | void
  onCorrect?: (t: TransacaoPendente, correction: string) => void
}

export function ChatBubble({ message, onConfirm, onCorrect }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const time = new Date(message.created_at).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <img src="/julius.png" alt="Julius" className="h-full w-full object-cover" />
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
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
