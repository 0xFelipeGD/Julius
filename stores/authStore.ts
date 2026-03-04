import { create } from 'zustand'

interface AuthState {
  userId: string | null
  email: string | null
  setUser: (userId: string, email: string) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  setUser: (userId, email) => set({ userId, email }),
  clearUser: () => set({ userId: null, email: null }),
}))
