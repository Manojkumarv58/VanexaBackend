'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem, User, FilterState } from './types'
import { demoUsers } from './mock-data'

// Cart Store
interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, variants?: Record<string, string>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1, variants) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          )
          
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          
          return {
            items: [...state.items, { product, quantity, selectedVariants: variants }],
          }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        )
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const shipping = subtotal > 100 ? 0 : 9.99
        const tax = subtotal * 0.08
        return subtotal + shipping + tax
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)

// Wishlist Store
interface WishlistStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (product: Product) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state
          }
          return { items: [...state.items, product] }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }))
      },
      
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId)
      },
      
      toggleItem: (product) => {
        const isInList = get().isInWishlist(product.id)
        if (isInList) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
)

// Auth Store
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true })
        
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Demo login logic
        const demoUser = demoUsers.find((u) => u.email === email)
        
        if (demoUser && password === 'demo123') {
          set({ user: demoUser, isAuthenticated: true, isLoading: false })
          return { success: true }
        }
        
        // Allow any email with password "demo123" for testing
        if (password === 'demo123') {
          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            role: 'user',
            createdAt: new Date().toISOString(),
          }
          set({ user: newUser, isAuthenticated: true, isLoading: false })
          return { success: true }
        }
        
        set({ isLoading: false })
        return { success: false, error: 'Invalid email or password' }
      },
      
      register: async (email, password, name) => {
        set({ isLoading: true })
        
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        
        // Check if email already exists
        if (demoUsers.some((u) => u.email === email)) {
          set({ isLoading: false })
          return { success: false, error: 'Email already exists' }
        }
        
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          role: 'user',
          createdAt: new Date().toISOString(),
        }
        
        set({ user: newUser, isAuthenticated: true, isLoading: false })
        return { success: true }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      
      updateUser: (data) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...data } })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

// Filter Store
interface FilterStore {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  setSearch: (search: string) => void
}

const defaultFilters: FilterState = {
  sortBy: 'popular',
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: defaultFilters,
  
  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }))
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters })
  },
  
  setSearch: (search) => {
    set((state) => ({
      filters: { ...state.filters, search },
    }))
  },
}))

// Search History Store
interface SearchStore {
  recentSearches: string[]
  addSearch: (term: string) => void
  clearSearches: () => void
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      recentSearches: [],
      
      addSearch: (term) => {
        const trimmed = term.trim()
        if (!trimmed) return
        
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== trimmed)
          return {
            recentSearches: [trimmed, ...filtered].slice(0, 5),
          }
        })
      },
      
      clearSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'search-history',
    }
  )
)
