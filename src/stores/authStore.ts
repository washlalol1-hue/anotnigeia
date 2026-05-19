import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  phone: string
  password: string
  inviteCode: string
  referredBy: string | null
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  users: User[] // simulated DB of all registered users
  login: (phone: string, password: string) => { success: boolean; error?: string }
  register: (phone: string, password: string, inviteCode?: string) => { success: boolean; error?: string }
  logout: () => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function generateInviteCode(): string {
  return 'PRN' + Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [],

      login: (phone, password) => {
        const { users } = get()
        const user = users.find((u) => u.phone === phone && u.password === password)
        if (!user) {
          return { success: false, error: 'არასწორი ნომერი ან პაროლი' }
        }
        set({ user, isAuthenticated: true })
        return { success: true }
      },

      register: (phone, password, referralCode?) => {
        const { users } = get()
        if (users.find((u) => u.phone === phone)) {
          return { success: false, error: 'ეს ნომერი უკვე რეგისტრირებულია' }
        }
        if (phone.length < 9) {
          return { success: false, error: 'ტელეფონის ნომერი არასწორია' }
        }
        if (password.length < 6) {
          return { success: false, error: 'პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო' }
        }

        let referredBy: string | null = null
        if (referralCode) {
          const referrer = users.find((u) => u.inviteCode === referralCode)
          if (referrer) {
            referredBy = referrer.id
          } else {
            return { success: false, error: 'მოწვევის კოდი არასწორია' }
          }
        }

        const newUser: User = {
          id: generateId(),
          phone,
          password,
          inviteCode: generateInviteCode(),
          referredBy,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, newUser],
          user: newUser,
          isAuthenticated: true,
        }))

        return { success: true }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'princess-auth',
    }
  )
)
