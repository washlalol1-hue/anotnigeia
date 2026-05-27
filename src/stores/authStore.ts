import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../services/api'

export interface User {
  id: string
  phone: string
  inviteCode: string
  balance: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (phone: string, password: string, inviteCode?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (phone, password) => {
        try {
          const data = await api.login(phone, password)
          set({
            user: {
              id: data.user.id,
              phone: data.user.phone,
              inviteCode: data.user.inviteCode,
              balance: data.user.balance,
            },
            token: data.token,
            isAuthenticated: true,
          })
          return { success: true }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'შეცდომა'
          return { success: false, error: message }
        }
      },

      register: async (phone, password, inviteCode?) => {
        try {
          const data = await api.register(phone, password, inviteCode)
          set({
            user: {
              id: data.user.id,
              phone: data.user.phone,
              inviteCode: data.user.inviteCode,
              balance: data.user.balance,
            },
            token: data.token,
            isAuthenticated: true,
          })
          return { success: true }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'შეცდომა'
          return { success: false, error: message }
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null })
      },

      setToken: (token) => {
        set({ token })
      },
    }),
    {
      name: 'princess-auth',
    }
  )
)
