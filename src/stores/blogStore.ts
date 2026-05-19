import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { blogPosts, BlogPost } from '../data/blogPosts'

interface BlogState {
  posts: BlogPost[]
  addPost: (comment: string, reward: number, username: string) => void
}

function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set) => ({
      posts: blogPosts,

      addPost: (comment, reward, username) => {
        const newPost: BlogPost = {
          id: generateId(),
          username,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          comment,
          reward,
          image: `https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop&t=${Date.now()}`,
        }
        set((state) => ({
          posts: [newPost, ...state.posts],
        }))
      },
    }),
    {
      name: 'princess-blog',
    }
  )
)
