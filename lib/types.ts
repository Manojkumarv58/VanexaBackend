export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: Category
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  variants?: ProductVariant[]
  tags: string[]
  createdAt: string
  featured?: boolean
}

export interface ProductVariant {
  id: string
  name: string
  type: 'color' | 'size'
  value: string
  inStock: boolean
}

export type Category = 
  | 'electronics'
  | 'fashion'
  | 'home'
  | 'beauty'
  | 'sports'
  | 'books'

export interface CartItem {
  product: Product
  quantity: number
  selectedVariants?: Record<string, string>
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'admin'
  createdAt: string
  addresses?: Address[]
}

export interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  status: OrderStatus
  total: number
  subtotal: number
  shipping: number
  tax: number
  shippingAddress: Address
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface FilterState {
  category?: Category
  minPrice?: number
  maxPrice?: number
  minRating?: number
  inStock?: boolean
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
  search?: string
}
