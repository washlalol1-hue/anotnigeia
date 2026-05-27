import { create } from 'zustand'
import { api } from '../services/api'

export interface BlogPost {
  id: number
  username: string
  comment: string
  reward: number
  image: string
  withdraw_amount?: number
  method?: string
  created_at: string
}

interface BlogState {
  posts: BlogPost[]
  loading: boolean
  loadPosts: () => Promise<void>
  createPost: (comment: string) => Promise<{ success: boolean; reward?: number; error?: string }>
}

export const useBlogStore = create<BlogState>()((set) => ({
  posts: [],
  loading: false,

  loadPosts: async () => {
    try {
      set({ loading: true })
      const data = await api.getBlogPosts()
      set({ posts: data, loading: false })
    } catch (err) {
      console.error('Failed to load blog posts:', err)
      set({ loading: false })
    }
  },

  createPost: async (comment) => {
    try {
      const data = await api.createBlogPost(comment)
      // Reload posts to get the new one from the server
      const posts = await api.getBlogPosts()
      set({ posts })
      return { success: true, reward: data.reward }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'შეცდომა'
      return { success: false, error: message }
    }
  },
}))
