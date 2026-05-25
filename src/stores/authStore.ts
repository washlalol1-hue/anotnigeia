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
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (phone, password) => {
        try {
          const data = await api.login(phone, password)
          set({
            user: data.user,
            isAuthenticated: true,
            token: data.token,
          })
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message || 'არასწორი ნომერი ან პაროლი' }
        }
      },

      register: async (phone, password, inviteCode?) => {
        try {
          const data = await api.register(phone, password, inviteCode)
          set({
            user: data.user,
            isAuthenticated: true,
            token: data.token,
          })
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message || 'რეგისტრაციის შეცდომა' }
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null })
      },

      setToken: (token) => {
        set({ token })
      },

      updateUser: (data) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },
    }),
    {
      name: 'princess-auth',
    }
  )
)
