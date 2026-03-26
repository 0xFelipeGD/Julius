import { create } from 'zustand'
import type { ChatMessage } from '@/lib/types'

interface AppState {
  chatMessages: ChatMessage[]
  setChatMessages: (msgs: ChatMessage[]) => void
  addChatMessage: (msg: ChatMessage) => void
  selectedYear: number
  setSelectedYear: (y: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  chatMessages: [],
  setChatMessages: (msgs) => set({ chatMessages: msgs }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  selectedYear: new Date().getFullYear(),
  setSelectedYear: (y) => set({ selectedYear: y }),
}))
