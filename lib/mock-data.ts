import type { Product, User, Order, Review, Category, Address } from './types'

export const categories: { id: Category; name: string; image: string; description: string }[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
    description: 'Latest gadgets and tech'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
    description: 'Trending styles for everyone'
  },
  {
    id: 'home',
    name: 'Home & Living',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop',
    description: 'Make your space beautiful'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    description: 'Skincare and cosmetics'
  },
  {
    id: 'sports',
    name: 'Sports & Outdoors',
    image: 'https://images.unsplash.com/photo-1461896836934- voices=50bebb26?w=400&h=400&fit=crop',
    description: 'Gear for active lifestyles'
  },
  {
    id: 'books',
    name: 'Books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop',
    description: 'Expand your knowledge'
  }
]

export const products: Product[] = [
  // Electronics
  {
    id: 'prod-001',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and remote workers.',
    price: 299.99,
    originalPrice: 349.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'
    ],
    category: 'electronics',
    rating: 4.8,
    reviewCount: 1247,
    inStock: true,
    stockCount: 45,
    tags: ['headphones', 'audio', 'wireless', 'noise-cancelling'],
    createdAt: '2024-01-15T10:00:00Z',
    featured: true,
    variants: [
      { id: 'v1', name: 'Black', type: 'color', value: '#000000', inStock: true },
      { id: 'v2', name: 'White', type: 'color', value: '#FFFFFF', inStock: true },
      { id: 'v3', name: 'Rose Gold', type: 'color', value: '#B76E79', inStock: false }
    ]
  },
  {
    id: 'prod-002',
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring, GPS tracking, and seamless smartphone integration. Water-resistant up to 50m.',
    price: 449.99,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'
    ],
    category: 'electronics',
    rating: 4.6,
    reviewCount: 892,
    inStock: true,
    stockCount: 28,
    tags: ['smartwatch', 'fitness', 'health', 'wearable'],
    createdAt: '2024-02-01T10:00:00Z',
    featured: true
  },
  {
    id: 'prod-003',
    name: 'Portable Bluetooth Speaker',
    description: 'Compact yet powerful speaker with 360-degree sound, waterproof design, and 20-hour playtime.',
    price: 129.99,
    originalPrice: 159.99,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop'
    ],
    category: 'electronics',
    rating: 4.5,
    reviewCount: 634,
    inStock: true,
    stockCount: 67,
    tags: ['speaker', 'bluetooth', 'portable', 'audio'],
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'prod-004',
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with customizable switches and programmable macros.',
    price: 179.99,
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=600&fit=crop'
    ],
    category: 'electronics',
    rating: 4.7,
    reviewCount: 445,
    inStock: true,
    stockCount: 34,
    tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],
    createdAt: '2024-02-10T10:00:00Z'
  },
  // Fashion
  {
    id: 'prod-005',
    name: 'Premium Leather Jacket',
    description: 'Handcrafted genuine leather jacket with a timeless design. Perfect for any occasion.',
    price: 389.99,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop'
    ],
    category: 'fashion',
    rating: 4.9,
    reviewCount: 312,
    inStock: true,
    stockCount: 15,
    tags: ['jacket', 'leather', 'premium', 'outerwear'],
    createdAt: '2024-01-25T10:00:00Z',
    featured: true,
    variants: [
      { id: 'v1', name: 'S', type: 'size', value: 'S', inStock: true },
      { id: 'v2', name: 'M', type: 'size', value: 'M', inStock: true },
      { id: 'v3', name: 'L', type: 'size', value: 'L', inStock: true },
      { id: 'v4', name: 'XL', type: 'size', value: 'XL', inStock: false }
    ]
  },
  {
    id: 'prod-006',
    name: 'Designer Sunglasses',
    description: 'UV-protected polarized lenses with a sleek modern frame. Includes premium carrying case.',
    price: 159.99,
    originalPrice: 199.99,
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop'
    ],
    category: 'fashion',
    rating: 4.4,
    reviewCount: 567,
    inStock: true,
    stockCount: 42,
    tags: ['sunglasses', 'accessories', 'designer', 'uv-protection'],
    createdAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 'prod-007',
    name: 'Minimalist Canvas Backpack',
    description: 'Water-resistant canvas backpack with padded laptop compartment. Perfect for work or travel.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'
    ],
    category: 'fashion',
    rating: 4.6,
    reviewCount: 823,
    inStock: true,
    stockCount: 56,
    tags: ['backpack', 'bag', 'travel', 'minimalist'],
    createdAt: '2024-01-30T10:00:00Z'
  },
  {
    id: 'prod-008',
    name: 'Classic Cashmere Sweater',
    description: 'Luxuriously soft 100% cashmere sweater. Timeless elegance for any wardrobe.',
    price: 249.99,
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop'
    ],
    category: 'fashion',
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    stockCount: 23,
    tags: ['sweater', 'cashmere', 'luxury', 'knitwear'],
    createdAt: '2024-02-12T10:00:00Z'
  },
  // Home & Living
  {
    id: 'prod-009',
    name: 'Modern Ceramic Vase Set',
    description: 'Set of 3 handcrafted ceramic vases in complementary sizes. Perfect for fresh or dried flowers.',
    price: 79.99,
    images: [
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=600&fit=crop'
    ],
    category: 'home',
    rating: 4.7,
    reviewCount: 445,
    inStock: true,
    stockCount: 38,
    tags: ['vase', 'ceramic', 'decor', 'handcrafted'],
    createdAt: '2024-01-18T10:00:00Z',
    featured: true
  },
  {
    id: 'prod-010',
    name: 'Luxury Scented Candle Collection',
    description: 'Premium soy wax candles with essential oils. Set of 4 seasonal fragrances.',
    price: 64.99,
    originalPrice: 79.99,
    images: [
      'https://images.unsplash.com/photo-1602028279679-ee0fbae7e8ae?w=600&h=600&fit=crop'
    ],
    category: 'home',
    rating: 4.9,
    reviewCount: 712,
    inStock: true,
    stockCount: 89,
    tags: ['candle', 'scented', 'home-fragrance', 'relaxation'],
    createdAt: '2024-02-08T10:00:00Z'
  },
  {
    id: 'prod-011',
    name: 'Minimalist Desk Lamp',
    description: 'LED desk lamp with adjustable brightness and color temperature. USB charging port included.',
    price: 89.99,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop'
    ],
    category: 'home',
    rating: 4.5,
    reviewCount: 334,
    inStock: true,
    stockCount: 45,
    tags: ['lamp', 'lighting', 'desk', 'led'],
    createdAt: '2024-01-22T10:00:00Z'
  },
  {
    id: 'prod-012',
    name: 'Organic Cotton Throw Blanket',
    description: 'Super soft organic cotton blanket. Perfect for cozy evenings on the couch.',
    price: 119.99,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop'
    ],
    category: 'home',
    rating: 4.8,
    reviewCount: 567,
    inStock: true,
    stockCount: 34,
    tags: ['blanket', 'organic', 'cotton', 'cozy'],
    createdAt: '2024-02-15T10:00:00Z'
  },
  // Beauty
  {
    id: 'prod-013',
    name: 'Vitamin C Serum',
    description: 'Brightening serum with 20% Vitamin C and hyaluronic acid. For radiant, youthful skin.',
    price: 54.99,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop'
    ],
    category: 'beauty',
    rating: 4.7,
    reviewCount: 1892,
    inStock: true,
    stockCount: 156,
    tags: ['serum', 'vitamin-c', 'skincare', 'brightening'],
    createdAt: '2024-01-12T10:00:00Z',
    featured: true
  },
  {
    id: 'prod-014',
    name: 'Luxury Makeup Brush Set',
    description: 'Professional 12-piece brush set with vegan bristles and elegant storage case.',
    price: 79.99,
    originalPrice: 99.99,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop'
    ],
    category: 'beauty',
    rating: 4.6,
    reviewCount: 678,
    inStock: true,
    stockCount: 67,
    tags: ['brushes', 'makeup', 'professional', 'vegan'],
    createdAt: '2024-02-03T10:00:00Z'
  },
  {
    id: 'prod-015',
    name: 'Natural Face Moisturizer',
    description: 'Lightweight daily moisturizer with SPF 30. Made with organic ingredients.',
    price: 42.99,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop'
    ],
    category: 'beauty',
    rating: 4.8,
    reviewCount: 1234,
    inStock: true,
    stockCount: 89,
    tags: ['moisturizer', 'spf', 'natural', 'organic'],
    createdAt: '2024-01-28T10:00:00Z'
  },
  {
    id: 'prod-016',
    name: 'Rose Gold Perfume',
    description: 'Elegant floral fragrance with notes of rose, jasmine, and sandalwood.',
    price: 124.99,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop'
    ],
    category: 'beauty',
    rating: 4.9,
    reviewCount: 456,
    inStock: true,
    stockCount: 28,
    tags: ['perfume', 'fragrance', 'floral', 'luxury'],
    createdAt: '2024-02-18T10:00:00Z'
  },
  // Sports
  {
    id: 'prod-017',
    name: 'Premium Yoga Mat',
    description: 'Extra-thick eco-friendly yoga mat with alignment lines. Non-slip surface.',
    price: 68.99,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop'
    ],
    category: 'sports',
    rating: 4.7,
    reviewCount: 923,
    inStock: true,
    stockCount: 78,
    tags: ['yoga', 'fitness', 'mat', 'eco-friendly'],
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'prod-018',
    name: 'Smart Water Bottle',
    description: 'Insulated water bottle with hydration tracking and LED temperature display.',
    price: 45.99,
    originalPrice: 59.99,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop'
    ],
    category: 'sports',
    rating: 4.5,
    reviewCount: 567,
    inStock: true,
    stockCount: 123,
    tags: ['water-bottle', 'hydration', 'smart', 'insulated'],
    createdAt: '2024-02-06T10:00:00Z'
  },
  {
    id: 'prod-019',
    name: 'Resistance Bands Set',
    description: 'Complete set of 5 resistance bands with carrying case. Perfect for home workouts.',
    price: 34.99,
    images: [
      'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&h=600&fit=crop'
    ],
    category: 'sports',
    rating: 4.6,
    reviewCount: 1456,
    inStock: true,
    stockCount: 234,
    tags: ['resistance-bands', 'fitness', 'home-workout', 'strength'],
    createdAt: '2024-01-24T10:00:00Z'
  },
  {
    id: 'prod-020',
    name: 'Running Shoes Pro',
    description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.',
    price: 159.99,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop'
    ],
    category: 'sports',
    rating: 4.8,
    reviewCount: 789,
    inStock: true,
    stockCount: 45,
    tags: ['shoes', 'running', 'athletic', 'comfortable'],
    createdAt: '2024-02-20T10:00:00Z',
    featured: true,
    variants: [
      { id: 'v1', name: 'US 8', type: 'size', value: '8', inStock: true },
      { id: 'v2', name: 'US 9', type: 'size', value: '9', inStock: true },
      { id: 'v3', name: 'US 10', type: 'size', value: '10', inStock: true },
      { id: 'v4', name: 'US 11', type: 'size', value: '11', inStock: false }
    ]
  },
  // Books
  {
    id: 'prod-021',
    name: 'The Art of Mindfulness',
    description: 'A comprehensive guide to mindfulness and meditation practices for modern life.',
    price: 24.99,
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop'
    ],
    category: 'books',
    rating: 4.8,
    reviewCount: 2345,
    inStock: true,
    stockCount: 189,
    tags: ['mindfulness', 'self-help', 'meditation', 'wellness'],
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 'prod-022',
    name: 'Modern Design Principles',
    description: 'Explore the fundamentals of contemporary design with beautiful illustrations.',
    price: 49.99,
    originalPrice: 64.99,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop'
    ],
    category: 'books',
    rating: 4.7,
    reviewCount: 456,
    inStock: true,
    stockCount: 67,
    tags: ['design', 'art', 'illustrated', 'creative'],
    createdAt: '2024-02-14T10:00:00Z'
  },
  {
    id: 'prod-023',
    name: 'Cookbook: Global Flavors',
    description: 'Over 200 recipes from around the world with stunning photography.',
    price: 39.99,
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=600&fit=crop'
    ],
    category: 'books',
    rating: 4.9,
    reviewCount: 1123,
    inStock: true,
    stockCount: 78,
    tags: ['cookbook', 'recipes', 'international', 'food'],
    createdAt: '2024-01-08T10:00:00Z'
  },
  {
    id: 'prod-024',
    name: 'Financial Freedom Guide',
    description: 'Practical strategies for building wealth and achieving financial independence.',
    price: 19.99,
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=600&fit=crop'
    ],
    category: 'books',
    rating: 4.6,
    reviewCount: 3456,
    inStock: true,
    stockCount: 234,
    tags: ['finance', 'investing', 'self-help', 'wealth'],
    createdAt: '2024-02-22T10:00:00Z'
  }
]

export const demoUsers: User[] = [
  {
    id: 'user-001',
    email: 'demo@example.com',
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    role: 'user',
    createdAt: '2024-01-01T10:00:00Z',
    addresses: [
      {
        id: 'addr-001',
        name: 'Home',
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'United States',
        isDefault: true
      }
    ]
  },
  {
    id: 'admin-001',
    email: 'admin@example.com',
    name: 'Sarah Admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'admin',
    createdAt: '2024-01-01T10:00:00Z'
  }
]

export const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'user-001',
    items: [
      { product: products[0], quantity: 1 },
      { product: products[2], quantity: 2 }
    ],
    status: 'delivered',
    subtotal: 559.97,
    shipping: 0,
    tax: 44.80,
    total: 604.77,
    shippingAddress: demoUsers[0].addresses![0],
    paymentMethod: 'Credit Card ending in 4242',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 'ORD-002',
    userId: 'user-001',
    items: [
      { product: products[4], quantity: 1 }
    ],
    status: 'shipped',
    subtotal: 389.99,
    shipping: 12.99,
    tax: 31.20,
    total: 434.18,
    shippingAddress: demoUsers[0].addresses![0],
    paymentMethod: 'Credit Card ending in 4242',
    createdAt: '2024-02-25T10:00:00Z',
    updatedAt: '2024-02-26T10:00:00Z'
  },
  {
    id: 'ORD-003',
    userId: 'user-001',
    items: [
      { product: products[12], quantity: 2 },
      { product: products[14], quantity: 1 }
    ],
    status: 'processing',
    subtotal: 152.97,
    shipping: 5.99,
    tax: 12.24,
    total: 171.20,
    shippingAddress: demoUsers[0].addresses![0],
    paymentMethod: 'Credit Card ending in 4242',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  }
]

export const sampleReviews: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    userId: 'user-002',
    userName: 'Michael R.',
    rating: 5,
    comment: 'Absolutely love these headphones! The noise cancellation is incredible and the sound quality is top-notch. Worth every penny.',
    createdAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 'rev-002',
    productId: 'prod-001',
    userId: 'user-003',
    userName: 'Emily S.',
    rating: 4,
    comment: 'Great headphones overall. Battery life is amazing. Only minor complaint is they can get a bit warm after extended use.',
    createdAt: '2024-02-08T10:00:00Z'
  },
  {
    id: 'rev-003',
    productId: 'prod-001',
    userId: 'user-004',
    userName: 'David K.',
    rating: 5,
    comment: 'Best purchase I have made this year. Perfect for working from home and blocking out distractions.',
    createdAt: '2024-02-05T10:00:00Z'
  }
]

// Helper to simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
