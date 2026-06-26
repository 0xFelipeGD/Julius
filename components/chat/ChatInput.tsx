'use client'

import { SendHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 112) + 'px'
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-julius-border bg-julius-card px-3 py-3"
    >
      <div className="flex min-w-0 items-end gap-2 rounded-2xl border border-julius-border bg-julius-raised px-2 py-2 shadow-[0_12px_32px_rgba(56,42,77,0.08)]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Write to Julius..."
          rows={1}
          className="max-h-28 min-h-10 min-w-0 flex-1 resize-none break-words bg-transparent px-2 py-2 text-sm leading-5 text-julius-text placeholder:text-julius-muted focus:outline-none disabled:opacity-50 [overflow-wrap:anywhere]"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-julius-accent text-julius-on-accent transition duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-35"
          aria-label="Send"
        >
          <SendHorizontal className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </form>
  )
}
