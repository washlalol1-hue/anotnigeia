// Simulated API service layer with realistic delays

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = {
  // Auth endpoints
  async login(_phone: string, _password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    await delay(800)
    return { success: true, token: 'demo-jwt-token-' + Date.now() }
  },

  async register(_phone: string, _password: string, _inviteCode?: string): Promise<{ success: boolean; error?: string }> {
    await delay(1000)
    return { success: true }
  },

  // Payment endpoints
  async processDeposit(_amount: number, _method: string): Promise<{ success: boolean; transactionId?: string }> {
    await delay(1500)
    return { success: true, transactionId: 'TXN-' + Date.now() }
  },

  async processWithdrawal(_amount: number, _account: string): Promise<{ success: boolean; estimatedTime?: string }> {
    await delay(2000)
    return { success: true, estimatedTime: '5-30 წუთი' }
  },

  // Product endpoints
  async purchaseProduct(_productId: number): Promise<{ success: boolean; orderId?: string }> {
    await delay(1200)
    return { success: true, orderId: 'ORD-' + Date.now() }
  },

  async collectEarnings(): Promise<{ success: boolean; amount?: number }> {
    await delay(500)
    return { success: true }
  },

  // Blog endpoints
  async submitPost(_comment: string, _image?: string): Promise<{ success: boolean }> {
    await delay(1000)
    return { success: true }
  },

  // Referral endpoints
  async getReferralStats(): Promise<{ team: number; totalRewards: number }> {
    await delay(600)
    return { team: 1, totalRewards: 0 }
  },
}
