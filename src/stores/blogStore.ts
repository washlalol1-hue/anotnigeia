import { create } from 'zustand'
import { api } from '../services/api'

export interface BlogPost {
  id: number
  username: string
  comment: string
  reward: number
  withdraw_amount?: number
  method?: string
  image: string
  created_at: string
}

interface BlogState {
  posts: BlogPost[]
  loading: boolean
  fetchPosts: () => Promise<void>
  addPost: (comment: string) => Promise<{ success: boolean; reward?: number; error?: string }>
}

export const useBlogStore = create<BlogState>()((set) => ({
  posts: [],
  loading: false,

  fetchPosts: async () => {
    try {
      set({ loading: true })
      const data = await api.getBlogPosts()
      set({ posts: data, loading: false })
    } catch (err) {
      console.error('Failed to fetch blog posts:', err)
      set({ loading: false })
    }
  },

  addPost: async (comment) => {
    try {
      const data = await api.createBlogPost(comment)
      // Refresh posts after adding
      const posts = await api.getBlogPosts()
      set({ posts })
      return { success: true, reward: data.reward }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },
}))
