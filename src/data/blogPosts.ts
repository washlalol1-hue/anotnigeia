export interface BlogPost {
  id: number
  username: string
  timestamp: string
  comment: string
  reward: number
  image: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    username: '55*****78',
    timestamp: '2026-05-18 13:38:20',
    comment: '5 წუთში დამიჯდა ანგარიშზე თანხა.',
    reward: 0.46,
    image: 'https://picsum.photos/400/200?random=20',
  },
  {
    id: 2,
    username: '59*****12',
    timestamp: '2026-05-17 10:22:05',
    comment: 'სწრაფი გატანა სასწაული პლაყფორმა',
    reward: 0.38,
    image: 'https://picsum.photos/400/200?random=21',
  },
  {
    id: 3,
    username: '57*****34',
    timestamp: '2026-05-16 18:45:33',
    comment: 'წამებშიიი\uD83D\uDC4F\uD83D\uDC4F',
    reward: 0.52,
    image: 'https://picsum.photos/400/200?random=22',
  },
  {
    id: 4,
    username: '51*****90',
    timestamp: '2026-05-15 09:12:47',
    comment: 'მაგარია.მადლობა',
    reward: 0.41,
    image: 'https://picsum.photos/400/200?random=23',
  },
  {
    id: 5,
    username: '58*****56',
    timestamp: '2026-05-14 21:05:10',
    comment: 'პირველი გატანა \u2705',
    reward: 0.33,
    image: 'https://picsum.photos/400/200?random=24',
  },
]
