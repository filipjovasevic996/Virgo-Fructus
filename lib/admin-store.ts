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

// Initialize with sample data
const initialProducts: AdminProduct[] = [
  {
    id: '1',
    slug: 'susena-narandza',
    name: { sr: 'Sušena Narandža', en: 'Dried Orange' },
    category: 'citrus',
    shortDescription: { sr: 'Savršeni kriškevi za koktel dekoraciju', en: 'Perfect slices for cocktail decoration' },
    description: { sr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', en: '' },
    images: [],
    badge: 'new',
    status: 'active',
    prices: [
      { weight: '50g', price: 350 },
      { weight: '100g', price: 600 },
      { weight: '1kg', price: 4800 },
      { weight: '3kg', price: 12000 },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    slug: 'suseni-limun',
    name: { sr: 'Sušeni Limun', en: 'Dried Lemon' },
    category: 'citrus',
    shortDescription: { sr: 'Intenzivan citrusni ukus', en: 'Intense citrus flavor' },
    description: { sr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', en: '' },
    images: [],
    status: 'active',
    prices: [
      { weight: '50g', price: 320 },
      { weight: '100g', price: 550 },
      { weight: '1kg', price: 4500 },
      { weight: '3kg', price: 11000 },
    ],
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-14T10:00:00Z',
  },
  {
    id: '3',
    slug: 'suseni-grejpfrut',
    name: { sr: 'Sušeni Grejpfrut', en: 'Dried Grapefruit' },
    category: 'citrus',
    shortDescription: { sr: 'Gorak i osvežavajući', en: 'Bitter and refreshing' },
    description: { sr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', en: '' },
    images: [],
    badge: 'limited',
    status: 'active',
    prices: [
      { weight: '50g', price: 400 },
      { weight: '100g', price: 700 },
      { weight: '1kg', price: 5500 },
      { weight: '3kg', price: 14000 },
    ],
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
  },
  {
    id: '4',
    slug: 'susene-jagode',
    name: { sr: 'Sušene Jagode', en: 'Dried Strawberries' },
    category: 'jagodičasto',
    shortDescription: { sr: 'Slatke i aromatične', en: 'Sweet and aromatic' },
    description: { sr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', en: '' },
    images: [],
    status: 'active',
    prices: [
      { weight: '50g', price: 450 },
      { weight: '100g', price: 800 },
      { weight: '1kg', price: 6500 },
      { weight: '3kg', price: 17000 },
    ],
    createdAt: '2024-01-12T10:00:00Z',
    updatedAt: '2024-01-12T10:00:00Z',
  },
  {
    id: '5',
    slug: 'susene-maline',
    name: { sr: 'Sušene Maline', en: 'Dried Raspberries' },
    category: 'jagodičasto',
    shortDescription: { sr: 'Premium srpske maline', en: 'Premium Serbian raspberries' },
    description: { sr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', en: '' },
    images: [],
    badge: 'sale',
    status: 'active',
    prices: [
      { weight: '50g', price: 500, salePrice: 420 },
      { weight: '100g', price: 900, salePrice: 750 },
      { weight: '1kg', price: 7500, salePrice: 6200 },
      { weight: '3kg', price: 20000, salePrice: 16500 },
    ],
    createdAt: '2024-01-11T10:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
  },
  {
    id: '6',
    slug: 'suseni-ananas',
    name: { sr: 'Sušeni Ananas', en: 'Dried Pineapple' },
    category: 'egzotično',
    shortDescription: { sr: 'Tropski ukus za koktele', en: 'Tropical flavor for cocktails' },
    description: { sr: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', en: '' },
    images: [],
    status: 'active',
    prices: [
      { weight: '50g', price: 380 },
      { weight: '100g', price: 650 },
      { weight: '1kg', price: 5200 },
      { weight: '3kg', price: 13500 },
    ],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
]

const initialOrders: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'VF-2024-001',
    customerName: 'Marko Petrović',
    customerEmail: 'marko@example.com',
    customerPhone: '+381 64 123 4567',
    customerType: 'B2C',
    shippingAddress: {
      street: 'Kralja Milana 25',
      city: 'Beograd',
      postalCode: '11000',
      country: 'Srbija',
    },
    items: [
      { productId: '1', productName: 'Sušena Narandža', weight: '100g', quantity: 2, price: 600 },
      { productId: '2', productName: 'Sušeni Limun', weight: '50g', quantity: 1, price: 320 },
    ],
    subtotal: 1520,
    shipping: 350,
    total: 1870,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-22T09:15:00Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'VF-2024-002',
    customerName: 'Hotel Moskva',
    customerEmail: 'nabavka@hotelmoskva.rs',
    customerPhone: '+381 11 268 6255',
    customerType: 'B2B',
    companyName: 'Hotel Moskva d.o.o.',
    pib: '123456789',
    shippingAddress: {
      street: 'Balkanska 1',
      city: 'Beograd',
      postalCode: '11000',
      country: 'Srbija',
    },
    items: [
      { productId: '1', productName: 'Sušena Narandža', weight: '3kg', quantity: 5, price: 12000 },
      { productId: '2', productName: 'Sušeni Limun', weight: '3kg', quantity: 3, price: 11000 },
      { productId: '3', productName: 'Sušeni Grejpfrut', weight: '1kg', quantity: 2, price: 5500 },
    ],
    subtotal: 104000,
    shipping: 0,
    total: 104000,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    notes: 'B2B wholesale order - free shipping',
    createdAt: '2024-01-25T09:00:00Z',
    updatedAt: '2024-01-25T11:30:00Z',
  },
  {
    id: 'ord-003',
    orderNumber: 'VF-2024-003',
    customerName: 'Ana Jovanović',
    customerEmail: 'ana.j@example.com',
    customerPhone: '+381 63 987 6543',
    customerType: 'B2C',
    shippingAddress: {
      street: 'Bulevar Oslobođenja 88',
      city: 'Novi Sad',
      postalCode: '21000',
      country: 'Srbija',
    },
    items: [
      { productId: '4', productName: 'Sušene Jagode', weight: '100g', quantity: 1, price: 800 },
      { productId: '5', productName: 'Sušene Maline', weight: '100g', quantity: 1, price: 750 },
    ],
    subtotal: 1550,
    shipping: 350,
    total: 1900,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    createdAt: '2024-01-26T16:45:00Z',
    updatedAt: '2024-01-27T08:00:00Z',
  },
  {
    id: 'ord-004',
    orderNumber: 'VF-2024-004',
    customerName: 'Bar Central',
    customerEmail: 'orders@barcentral.rs',
    customerPhone: '+381 11 333 4444',
    customerType: 'B2B',
    companyName: 'Bar Central d.o.o.',
    pib: '987654321',
    shippingAddress: {
      street: 'Strahinjića Bana 72',
      city: 'Beograd',
      postalCode: '11000',
      country: 'Srbija',
    },
    items: [
      { productId: '1', productName: 'Sušena Narandža', weight: '1kg', quantity: 10, price: 4800 },
      { productId: '6', productName: 'Sušeni Ananas', weight: '1kg', quantity: 5, price: 5200 },
    ],
    subtotal: 74000,
    shipping: 0,
    total: 74000,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'bank_transfer',
    createdAt: '2024-01-28T10:00:00Z',
    updatedAt: '2024-01-28T10:00:00Z',
  },
  {
    id: 'ord-005',
    orderNumber: 'VF-2024-005',
    customerName: 'Jelena Nikolić',
    customerEmail: 'jelena.n@example.com',
    customerPhone: '+381 65 111 2222',
    customerType: 'B2C',
    shippingAddress: {
      street: 'Vojvode Stepe 150',
      city: 'Beograd',
      postalCode: '11000',
      country: 'Srbija',
    },
    items: [
      { productId: '6', productName: 'Sušeni Ananas', weight: '50g', quantity: 3, price: 380 },
    ],
    subtotal: 1140,
    shipping: 350,
    total: 1490,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'card',
    notes: 'Customer cancelled - refund processed',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
]

const initialTransactions: Transaction[] = [
  {
    id: 'txn-001',
    orderId: 'ord-001',
    orderNumber: 'VF-2024-001',
    type: 'payment',
    amount: 1870,
    status: 'completed',
    paymentMethod: 'card',
    customerName: 'Marko Petrović',
    createdAt: '2024-01-20T14:31:00Z',
  },
  {
    id: 'txn-002',
    orderId: 'ord-002',
    orderNumber: 'VF-2024-002',
    type: 'payment',
    amount: 104000,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    customerName: 'Hotel Moskva',
    createdAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 'txn-003',
    orderId: 'ord-003',
    orderNumber: 'VF-2024-003',
    type: 'payment',
    amount: 1900,
    status: 'completed',
    paymentMethod: 'card',
    customerName: 'Ana Jovanović',
    createdAt: '2024-01-26T16:46:00Z',
  },
  {
    id: 'txn-004',
    orderId: 'ord-005',
    orderNumber: 'VF-2024-005',
    type: 'payment',
    amount: 1490,
    status: 'completed',
    paymentMethod: 'card',
    customerName: 'Jelena Nikolić',
    createdAt: '2024-01-15T12:01:00Z',
  },
  {
    id: 'txn-005',
    orderId: 'ord-005',
    orderNumber: 'VF-2024-005',
    type: 'refund',
    amount: 1490,
    status: 'completed',
    paymentMethod: 'card',
    customerName: 'Jelena Nikolić',
    createdAt: '2024-01-16T09:00:00Z',
  },
]

// Global store
class AdminStore {
  private products: AdminProduct[] = initialProducts
  private orders: Order[] = initialOrders
  private transactions: Transaction[] = initialTransactions

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
