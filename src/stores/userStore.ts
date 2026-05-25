import { create } from 'zustand'
import { api } from '../services/api'

export interface PurchasedProduct {
  id: string
  product_id: number
  name: string
  days: number
  daily_income: number
  total_income: number
  price: number
  hash_rate: string
  image: string
  purchased_at: string
  total_earned: number
  status: 'active' | 'completed'
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'earning' | 'referral_bonus'
  amount: number
  description: string
  created_at: string
  status: 'completed' | 'pending' | 'failed'
}

export interface Referral {
  id: string
  referred_id: string
  phone: string
  level: number
  joined_at: string
  total_earnings: number
}

export interface UserProfile {
  id: string
  phone: string
  invite_code: string
  balance: number
  total_deposits: number
  total_withdrawals: number
  withdrawal_account: string | null
  created_at: string
  productCount: number
  referralCount: number
}

interface UserState {
  profile: UserProfile | null
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  purchasedProducts: PurchasedProduct[]
  transactions: Transaction[]
  referrals: Referral[]
  inviteCode: string
  withdrawalAccount: string | null
  loading: boolean

  fetchProfile: () => Promise<void>
  fetchTransactions: () => Promise<void>
  fetchMyProducts: () => Promise<void>
  fetchReferrals: () => Promise<void>
  deposit: (amount: number) => Promise<{ success: boolean; error?: string }>
  withdraw: (amount: number) => Promise<{ success: boolean; error?: string }>
  purchaseProduct: (productId: number) => Promise<{ success: boolean; error?: string }>
  collectEarnings: () => Promise<{ success: boolean; earned?: number; error?: string }>
  setWithdrawalAccount: (account: string) => Promise<{ success: boolean; error?: string }>
  getTotalDailyIncome: () => number
  reset: () => void
}

const initialState = {
  profile: null,
  balance: 0,
  totalDeposits: 0,
  totalWithdrawals: 0,
  purchasedProducts: [],
  transactions: [],
  referrals: [],
  inviteCode: '',
  withdrawalAccount: null,
  loading: false,
}

export const useUserStore = create<UserState>()((set, get) => ({
  ...initialState,

  fetchProfile: async () => {
    try {
      const data = await api.getProfile()
      set({
        profile: data,
        balance: data.balance,
        totalDeposits: data.total_deposits,
        totalWithdrawals: data.total_withdrawals,
        withdrawalAccount: data.withdrawal_account,
        inviteCode: data.invite_code,
      })
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  },

  fetchTransactions: async () => {
    try {
      const data = await api.getTransactions()
      set({ transactions: data })
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  },

  fetchMyProducts: async () => {
    try {
      const data = await api.getMyProducts()
      set({ purchasedProducts: data })
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  },

  fetchReferrals: async () => {
    try {
      const data = await api.getReferrals()
      set({
        referrals: data.referrals,
        inviteCode: data.inviteCode,
      })
    } catch (err) {
      console.error('Failed to fetch referrals:', err)
    }
  },

  deposit: async (amount) => {
    try {
      const data = await api.deposit(amount)
      set({ balance: data.balance })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },

  withdraw: async (amount) => {
    try {
      const data = await api.withdraw(amount)
      set({ balance: data.balance })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },

  purchaseProduct: async (productId) => {
    try {
      const data = await api.purchaseProduct(productId)
      set({ balance: data.balance })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },

  collectEarnings: async () => {
    try {
      const data = await api.collectEarnings()
      set({ balance: data.balance })
      return { success: true, earned: data.earned }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },

  setWithdrawalAccount: async (account) => {
    try {
      await api.setWithdrawalAccount(account)
      set({ withdrawalAccount: account })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },

  getTotalDailyIncome: () => {
    return get()
      .purchasedProducts.filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.daily_income, 0)
  },

  reset: () => {
    set(initialState)
  },
}))
