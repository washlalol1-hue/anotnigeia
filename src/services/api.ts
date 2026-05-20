// Real API service layer connecting to Express backend

const BASE_URL = '/api';

function getToken(): string | null {
  try {
    const authData = localStorage.getItem('princess-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || null;
    }
  } catch {}
  return null;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'შეცდომა');
  return data;
}

export const api = {
  // Auth
  login: (phone: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) }),

  register: (phone: string, password: string, inviteCode?: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ phone, password, inviteCode }) }),

  // User
  getProfile: () => request('/user/profile'),
  setWithdrawalAccount: (account: string) =>
    request('/user/set-account', { method: 'POST', body: JSON.stringify({ account }) }),

  // Financial
  deposit: (amount: number) =>
    request('/deposit', { method: 'POST', body: JSON.stringify({ amount }) }),

  withdraw: (amount: number) =>
    request('/withdraw', { method: 'POST', body: JSON.stringify({ amount }) }),

  getTransactions: () => request('/transactions'),

  // Products
  getProducts: () => request('/products'),
  purchaseProduct: (productId: number) =>
    request('/purchase', { method: 'POST', body: JSON.stringify({ productId }) }),

  getMyProducts: () => request('/my-products'),
  collectEarnings: () =>
    request('/collect-earnings', { method: 'POST' }),

  // Referrals
  getReferrals: () => request('/referrals'),

  // Blog
  getBlogPosts: () => request('/blog'),
  createBlogPost: (comment: string) =>
    request('/blog', { method: 'POST', body: JSON.stringify({ comment }) }),

  // Stats
  getStats: () => request('/stats'),
};
