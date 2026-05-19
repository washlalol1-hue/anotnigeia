import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '../data/products'

export interface PurchasedProduct {
  id: string
  product: Product
  purchasedAt: string
  totalEarned: number
  status: 'active' | 'completed'
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'purchase' | 'earning' | 'referral_bonus'
  amount: number
  description: string
  createdAt: string
  status: 'completed' | 'pending' | 'failed'
}

export interface Referral {
  id: string
  userId: string
  phone: string
  level: number
  joinedAt: string
  totalEarnings: number
}

interface UserState {
  balance: number
  totalDeposits: number
  totalWithdrawals: number
  purchasedProducts: PurchasedProduct[]
  transactions: Transaction[]
  referrals: Referral[]
  withdrawalAccount: string | null

  deposit: (amount: number) => void
  withdraw: (amount: number) => { success: boolean; error?: string }
  purchaseProduct: (product: Product) => { success: boolean; error?: string }
  collectEarnings: () => void
  addReferral: (phone: string, userId: string, level: number) => void
  setWithdrawalAccount: (account: string) => void
  getActiveProducts: () => PurchasedProduct[]
  getTotalDailyIncome: () => number
  reset: () => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const initialState = {
  balance: 7,
  totalDeposits: 0,
  totalWithdrawals: 0,
  purchasedProducts: [],
  transactions: [],
  referrals: [],
  withdrawalAccount: null,
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      deposit: (amount) => {
        const tx: Transaction = {
          id: generateId(),
          type: 'deposit',
          amount,
          description: `ბალანსის შევსება ₾${amount}`,
          createdAt: new Date().toISOString(),
          status: 'completed',
        }
        set((state) => ({
          balance: state.balance + amount,
          totalDeposits: state.totalDeposits + amount,
          transactions: [tx, ...state.transactions],
        }))
      },

      withdraw: (amount) => {
        const { balance, withdrawalAccount } = get()
        if (!withdrawalAccount) {
          return { success: false, error: 'გთხოვთ ჯერ დააყენოთ გატანის ანგარიში' }
        }
        if (amount < 5) {
          return { success: false, error: 'მინიმალური გატანა: ₾5' }
        }
        if (amount > balance) {
          return { success: false, error: 'არასაკმარისი ბალანსი' }
        }
        const tx: Transaction = {
          id: generateId(),
          type: 'withdrawal',
          amount: -amount,
          description: `თანხის გატანა ₾${amount} → ${withdrawalAccount}`,
          createdAt: new Date().toISOString(),
          status: 'pending',
        }
        set((state) => ({
          balance: state.balance - amount,
          totalWithdrawals: state.totalWithdrawals + amount,
          transactions: [tx, ...state.transactions],
        }))
        // Simulate processing - mark as completed after 3 seconds
        setTimeout(() => {
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === tx.id ? { ...t, status: 'completed' as const } : t
            ),
          }))
        }, 3000)
        return { success: true }
      },

      purchaseProduct: (product) => {
        const { balance } = get()
        if (product.price > balance) {
          return { success: false, error: 'არასაკმარისი ბალანსი. გთხოვთ შეავსოთ ბალანსი.' }
        }

        const purchased: PurchasedProduct = {
          id: generateId(),
          product,
          purchasedAt: new Date().toISOString(),
          totalEarned: 0,
          status: 'active',
        }

        const tx: Transaction = {
          id: generateId(),
          type: 'purchase',
          amount: -product.price,
          description: `${product.name} შეძენა`,
          createdAt: new Date().toISOString(),
          status: 'completed',
        }

        set((state) => ({
          balance: state.balance - product.price,
          purchasedProducts: [...state.purchasedProducts, purchased],
          transactions: [tx, ...state.transactions],
        }))
        return { success: true }
      },

      collectEarnings: () => {
        const { purchasedProducts, referrals } = get()
        let totalNewEarnings = 0

        const updatedProducts = purchasedProducts.map((pp) => {
          if (pp.status !== 'active') return pp

          const startDate = new Date(pp.purchasedAt)
          const now = new Date()
          const hoursElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60)
          const hourlyRate = pp.product.dailyIncome / 24
          const totalPossibleEarnings = Math.min(
            hourlyRate * hoursElapsed,
            pp.product.totalIncome
          )
          const newEarnings = totalPossibleEarnings - pp.totalEarned

          if (newEarnings > 0.01) {
            totalNewEarnings += newEarnings
            const isCompleted = totalPossibleEarnings >= pp.product.totalIncome
            return {
              ...pp,
              totalEarned: totalPossibleEarnings,
              status: isCompleted ? 'completed' as const : 'active' as const,
            }
          }
          return pp
        })

        if (totalNewEarnings > 0.01) {
          // Calculate referral bonus (simulate bonus from referrals' earnings)
          let referralBonus = 0
          if (referrals.length > 0) {
            // Level 1: 25% of their earnings
            const l1 = referrals.filter((r) => r.level === 1).length
            const l2 = referrals.filter((r) => r.level === 2).length
            const l3 = referrals.filter((r) => r.level === 3).length
            referralBonus = (l1 * 0.25 + l2 * 0.02 + l3 * 0.01) * (totalNewEarnings * 0.3)
          }

          const transactions: Transaction[] = []
          
          const earningTx: Transaction = {
            id: generateId(),
            type: 'earning',
            amount: totalNewEarnings,
            description: `მაინერების შემოსავალი +₾${totalNewEarnings.toFixed(2)}`,
            createdAt: new Date().toISOString(),
            status: 'completed',
          }
          transactions.push(earningTx)

          if (referralBonus > 0.01) {
            const refTx: Transaction = {
              id: generateId(),
              type: 'referral_bonus',
              amount: referralBonus,
              description: `რეფერალ ბონუსი +₾${referralBonus.toFixed(2)}`,
              createdAt: new Date().toISOString(),
              status: 'completed',
            }
            transactions.push(refTx)
          }

          set((state) => ({
            balance: state.balance + totalNewEarnings + referralBonus,
            purchasedProducts: updatedProducts,
            transactions: [...transactions, ...state.transactions],
          }))
        }
      },

      addReferral: (phone, userId, level) => {
        const referral: Referral = {
          id: generateId(),
          userId,
          phone,
          level,
          joinedAt: new Date().toISOString(),
          totalEarnings: 0,
        }
        set((state) => ({
          referrals: [...state.referrals, referral],
        }))
      },

      setWithdrawalAccount: (account) => {
        set({ withdrawalAccount: account })
      },

      getActiveProducts: () => {
        return get().purchasedProducts.filter((p) => p.status === 'active')
      },

      getTotalDailyIncome: () => {
        return get()
          .purchasedProducts.filter((p) => p.status === 'active')
          .reduce((sum, p) => sum + p.product.dailyIncome, 0)
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'princess-user',
    }
  )
)
