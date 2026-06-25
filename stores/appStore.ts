import { create } from 'zustand'
import type { ChatMessage } from '@/lib/types'

interface AppState {
  chatMessages: ChatMessage[]
  chatHistoryKey: string | null
  setChatMessages: (msgs: ChatMessage[]) => void
  setChatHistoryKey: (key: string | null) => void
  addChatMessage: (msg: ChatMessage) => void
  selectedYear: number
  setSelectedYear: (y: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  chatMessages: [],
  chatHistoryKey: null,
  setChatMessages: (msgs) => set({ chatMessages: msgs }),
  setChatHistoryKey: (key) => set({ chatHistoryKey: key }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  selectedYear: new Date().getFullYear(),
  setSelectedYear: (y) => set({ selectedYear: y }),
}))
