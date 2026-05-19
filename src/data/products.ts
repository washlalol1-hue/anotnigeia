export interface Product {
  id: number
  name: string
  days: number
  dailyIncome: number
  totalIncome: number
  price: number
  image: string
  hashRate: string
}

export const products: Product[] = [
  { id: 1, name: 'Miner S1', days: 80, dailyIncome: 2.5, totalIncome: 200, price: 20, hashRate: '15 TH/s', image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop' },
  { id: 2, name: 'Miner S2', days: 80, dailyIncome: 6.7, totalIncome: 534, price: 50, hashRate: '38 TH/s', image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop' },
  { id: 3, name: 'Miner Pro', days: 80, dailyIncome: 17.2, totalIncome: 1372, price: 120, hashRate: '95 TH/s', image: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=400&h=200&fit=crop' },
  { id: 4, name: 'Miner X1', days: 80, dailyIncome: 36.8, totalIncome: 2940, price: 250, hashRate: '200 TH/s', image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop' },
  { id: 5, name: 'Miner X2', days: 80, dailyIncome: 78.8, totalIncome: 6300, price: 520, hashRate: '420 TH/s', image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop' },
  { id: 6, name: 'Miner Ultra', days: 80, dailyIncome: 172.0, totalIncome: 13760, price: 1100, hashRate: '850 TH/s', image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=200&fit=crop' },
  { id: 7, name: 'Miner Max', days: 80, dailyIncome: 403.0, totalIncome: 32240, price: 2500, hashRate: '1.8 PH/s', image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=400&h=200&fit=crop' },
  { id: 8, name: 'Miner Titan', days: 80, dailyIncome: 866.0, totalIncome: 69280, price: 5200, hashRate: '3.5 PH/s', image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=200&fit=crop' },
]
