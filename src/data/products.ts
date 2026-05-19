export interface Product {
  id: number
  name: string
  days: number
  dailyIncome: number
  totalIncome: number
  price: number
  image: string
}

export const products: Product[] = [
  { id: 1, name: 'Miner S1', days: 80, dailyIncome: 2.5, totalIncome: 200, price: 20, image: 'https://picsum.photos/400/200?random=10' },
  { id: 2, name: 'Miner S2', days: 80, dailyIncome: 6.7, totalIncome: 534, price: 50, image: 'https://picsum.photos/400/200?random=11' },
  { id: 3, name: 'Miner Pro', days: 80, dailyIncome: 17.2, totalIncome: 1372, price: 120, image: 'https://picsum.photos/400/200?random=12' },
  { id: 4, name: 'Miner X1', days: 80, dailyIncome: 36.8, totalIncome: 2940, price: 250, image: 'https://picsum.photos/400/200?random=13' },
  { id: 5, name: 'Miner X2', days: 80, dailyIncome: 78.8, totalIncome: 6300, price: 520, image: 'https://picsum.photos/400/200?random=14' },
  { id: 6, name: 'Miner Ultra', days: 80, dailyIncome: 172.0, totalIncome: 13760, price: 1100, image: 'https://picsum.photos/400/200?random=15' },
  { id: 7, name: 'Miner Max', days: 80, dailyIncome: 403.0, totalIncome: 32240, price: 2500, image: 'https://picsum.photos/400/200?random=16' },
  { id: 8, name: 'Miner Titan', days: 80, dailyIncome: 866.0, totalIncome: 69280, price: 5200, image: 'https://picsum.photos/400/200?random=17' },
]
