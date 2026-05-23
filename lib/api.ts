import { products, categories, sampleOrders, sampleReviews, delay } from './mock-data'
import type { Product, Order, Review, FilterState, Category } from './types'

// Simulated API functions with realistic delays

export async function fetchProducts(filters?: FilterState): Promise<Product[]> {
  await delay(500)
  
  let filtered = [...products]
  
  if (filters) {
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category)
    }
    
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!)
    }
    
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!)
    }
    
    if (filters.minRating !== undefined) {
      filtered = filtered.filter((p) => p.rating >= filters.minRating!)
    }
    
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.inStock)
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.tags.some((t) => t.toLowerCase().includes(searchLower))
      )
    }
    
    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'popular':
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }
  }
  
  return filtered
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await delay(300)
  return products.find((p) => p.id === id) || null
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  await delay(400)
  return products.filter((p) => p.featured)
}

export async function fetchNewArrivals(): Promise<Product[]> {
  await delay(400)
  return [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
}

export async function fetchProductsByCategory(category: Category): Promise<Product[]> {
  await delay(400)
  return products.filter((p) => p.category === category)
}

export async function fetchRelatedProducts(productId: string): Promise<Product[]> {
  await delay(300)
  const product = products.find((p) => p.id === productId)
  if (!product) return []
  
  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, 4)
}

export async function fetchCategories() {
  await delay(200)
  return categories
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay(300)
  
  if (!query.trim()) return []
  
  const searchLower = query.toLowerCase()
  return products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower))
    )
    .slice(0, 5)
}

// Orders
export async function fetchOrders(userId: string): Promise<Order[]> {
  await delay(500)
  return sampleOrders.filter((o) => o.userId === userId)
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  await delay(300)
  return sampleOrders.find((o) => o.id === orderId) || null
}

export async function fetchAllOrders(): Promise<Order[]> {
  await delay(500)
  return sampleOrders
}

// Reviews
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  await delay(400)
  return sampleReviews.filter((r) => r.productId === productId)
}

// Admin Stats
export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
}

export async function fetchAdminStats(): Promise<AdminStats> {
  await delay(500)
  
  const totalRevenue = sampleOrders.reduce((sum, order) => sum + order.total, 0)
  
  return {
    totalRevenue,
    totalOrders: sampleOrders.length,
    totalCustomers: 156,
    totalProducts: products.length,
    revenueChange: 12.5,
    ordersChange: 8.2,
  }
}

export interface RevenueData {
  month: string
  revenue: number
  orders: number
}

export async function fetchRevenueData(): Promise<RevenueData[]> {
  await delay(400)
  
  return [
    { month: 'Jan', revenue: 12400, orders: 45 },
    { month: 'Feb', revenue: 15800, orders: 52 },
    { month: 'Mar', revenue: 18200, orders: 61 },
    { month: 'Apr', revenue: 14600, orders: 48 },
    { month: 'May', revenue: 21300, orders: 72 },
    { month: 'Jun', revenue: 19800, orders: 67 },
  ]
}

export interface CategorySales {
  category: string
  sales: number
  fill: string
}

export async function fetchCategorySales(): Promise<CategorySales[]> {
  await delay(400)
  
  return [
    { category: 'Electronics', sales: 35, fill: 'var(--chart-1)' },
    { category: 'Fashion', sales: 25, fill: 'var(--chart-2)' },
    { category: 'Home', sales: 18, fill: 'var(--chart-3)' },
    { category: 'Beauty', sales: 12, fill: 'var(--chart-4)' },
    { category: 'Sports', sales: 10, fill: 'var(--chart-5)' },
  ]
}
