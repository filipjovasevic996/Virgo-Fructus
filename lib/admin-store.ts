// In-memory store for admin data (in production, this would be a database)
// This simulates persistence across API routes

export interface LocalizedField {
  sr: string
  en: string
}

export interface AdminProduct {
  id: string
  slug: string
  name: LocalizedField
  category: 'citrus' | 'jagodičasto' | 'egzotično'
  description: LocalizedField
  shortDescription: LocalizedField
  images: string[]
  badge?: 'new' | 'limited' | 'sale' | ''
  status: 'active' | 'draft' | 'hidden'
  prices: {
    weight: string
    price: number
    salePrice?: number
  }[]
  createdAt: string
  updatedAt: string
  isFavorite: boolean
  /** Available inventory in kg (API may return numeric as string) */
  stockKg?: number | string
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerType: 'B2B' | 'B2C'
  companyName?: string
  pib?: string
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  items: {
    productId: string
    productName: string
    weight: string
    quantity: number
    price: number
  }[]
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  orderId: string
  orderNumber: string
  type: 'payment' | 'refund'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery'
  customerName: string
  createdAt: string
}


// Global store
class AdminStore {
  private products: AdminProduct[] = []
  private orders: Order[] = []
  private transactions: Transaction[] = []

  // Products
  getProducts(): AdminProduct[] {
    return [...this.products]
  }

  getProduct(id: string): AdminProduct | undefined {
    return this.products.find((p) => p.id === id)
  }

  addProduct(product: Omit<AdminProduct, 'id' | 'createdAt' | 'updatedAt'>): AdminProduct {
    const newProduct: AdminProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.products.unshift(newProduct)
    return newProduct
  }

  updateProduct(id: string, updates: Partial<AdminProduct>): AdminProduct | null {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return null
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return this.products[index]
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex((p) => p.id === id)
    if (index === -1) return false
    this.products.splice(index, 1)
    return true
  }

  // Orders
  getOrders(): Order[] {
    return [...this.orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  getOrder(id: string): Order | undefined {
    return this.orders.find((o) => o.id === id)
  }

  updateOrderStatus(id: string, status: Order['status']): Order | null {
    const index = this.orders.findIndex((o) => o.id === id)
    if (index === -1) return null
    this.orders[index] = {
      ...this.orders[index],
      status,
      updatedAt: new Date().toISOString(),
    }
    return this.orders[index]
  }

  // Transactions
  getTransactions(): Transaction[] {
    return [...this.transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Stats
  getStats() {
    const totalRevenue = this.transactions
      .filter((t) => t.type === 'payment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalRefunds = this.transactions
      .filter((t) => t.type === 'refund' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const pendingOrders = this.orders.filter((o) => o.status === 'pending').length
    const processingOrders = this.orders.filter((o) => o.status === 'processing').length
    const completedOrders = this.orders.filter((o) => o.status === 'delivered').length

    return {
      totalRevenue: totalRevenue - totalRefunds,
      totalOrders: this.orders.length,
      pendingOrders,
      processingOrders,
      completedOrders,
      totalProducts: this.products.length,
      b2bOrders: this.orders.filter((o) => o.customerType === 'B2B').length,
      b2cOrders: this.orders.filter((o) => o.customerType === 'B2C').length,
    }
  }
}

// Singleton instance
export const adminStore = new AdminStore()
