import type { ChatMessage, TransacaoPendente } from '@/lib/types'
import { TransactionConfirm } from './TransactionConfirm'
import { Bot } from 'lucide-react'

interface ChatBubbleProps {
  message: ChatMessage
  onConfirm?: (t: TransacaoPendente) => Promise<void> | void
  onCorrect?: (t: TransacaoPendente, correction: string) => void
}

export function ChatBubble({ message, onConfirm, onCorrect }: ChatBubbleProps) {
  const isUser = message.role === 'user'
  const hasPendingTransaction = Boolean(message.transacao_pendente && onConfirm && onCorrect)
  const time = new Date(message.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-julius-accent-soft text-julius-accent">
          <Bot className="h-4 w-4" strokeWidth={1.9} />
        </div>
      )}
      <div className={`min-w-0 ${hasPendingTransaction ? 'w-[calc(100%-2.5rem)] max-w-sm' : 'max-w-[82%]'}`}>
        <div
          className={`w-fit max-w-full rounded-2xl px-4 py-2.5 shadow-[0_10px_28px_rgba(56,42,77,0.08)] ${
            isUser
              ? 'rounded-br-md bg-julius-accent text-julius-on-accent'
              : 'rounded-bl-md bg-julius-card text-julius-text'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">
            {message.content || 'Julius had trouble reading that.'}
          </p>
        </div>
        {hasPendingTransaction && message.transacao_pendente && onConfirm && onCorrect && (
          <div className="mt-2">
            <TransactionConfirm
              transacao={message.transacao_pendente}
              onConfirm={onConfirm}
              onCorrect={onCorrect}
            />
          </div>
        )}
        <p className={`mt-1 text-[11px] text-julius-muted ${isUser ? 'text-right' : 'text-left'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
