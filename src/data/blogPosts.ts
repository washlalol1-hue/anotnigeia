export interface BlogPost {
  id: number
  username: string
  timestamp: string
  comment: string
  reward: number
  image: string
  withdrawAmount?: number
  method?: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    username: '55*****78',
    timestamp: '2026-05-18 13:38:20',
    comment: '₾450 გავიტანე, 3 წუთში დამიჯდა BOG-ზე! Miner Ultra-მ გაამართლა 💰',
    reward: 0.46,
    withdrawAmount: 450,
    method: 'BOG',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    username: '59*****12',
    timestamp: '2026-05-17 10:22:05',
    comment: 'მეორე გატანა ₾120, TBC Pay-ზე წამებში ჩამოვარდა. მაინერები 24/7 მუშაობს 🔥',
    reward: 0.38,
    withdrawAmount: 120,
    method: 'TBC Pay',
    image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    username: '57*****34',
    timestamp: '2026-05-16 18:45:33',
    comment: 'პირველი თვის შემოსავალი ₾2,100 🤑 Miner Max-ით. ინვესტიცია უკვე დაბრუნდა!',
    reward: 0.52,
    withdrawAmount: 2100,
    method: 'BOG',
    image: 'https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=400&h=200&fit=crop',
  },
  {
    id: 4,
    username: '51*****90',
    timestamp: '2026-05-15 09:12:47',
    comment: '₾85 გავიტანე, ჩემი მეგობრის რეფერალიდანაც მაქვს ბონუსი. საუკეთესოა! 👏',
    reward: 0.41,
    withdrawAmount: 85,
    method: 'TBC Pay',
    image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop',
  },
  {
    id: 5,
    username: '58*****56',
    timestamp: '2026-05-14 21:05:10',
    comment: 'პირველი გატანა ₾35 ✅ Miner S2-ით დავიწყე, ახლა Pro-ზე გადავალ. რეალურია!',
    reward: 0.33,
    withdrawAmount: 35,
    method: 'BOG',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop',
  },
  {
    id: 6,
    username: '56*****41',
    timestamp: '2026-05-13 15:30:00',
    comment: '3 მაინერი მაქვს, დღეში ₾56 შემოსავალი. ყოველ დღე ვაგროვებ 💪',
    reward: 0.44,
    withdrawAmount: 280,
    method: 'BOG',
    image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=400&h=200&fit=crop',
  },
  {
    id: 7,
    username: '53*****67',
    timestamp: '2026-05-12 08:15:42',
    comment: 'რეფერალიდან ₾125 ბონუსი მივიღე! გუნდში 12 ადამიანი მყავს 🚀',
    reward: 0.55,
    withdrawAmount: 125,
    method: 'TBC Pay',
    image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=400&h=200&fit=crop',
  },
  {
    id: 8,
    username: '52*****89',
    timestamp: '2026-05-11 19:45:11',
    comment: 'Miner Titan შევიძინე, პირველ კვირაში ₾6,000+ შემოსავალი. ვერ მჯერა 😱',
    reward: 0.61,
    withdrawAmount: 6062,
    method: 'BOG',
    image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=200&fit=crop',
  },
]
