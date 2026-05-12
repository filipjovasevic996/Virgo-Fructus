export interface Product {
  id: string
  slug: string
  name: string
  category: 'citrus' | 'jagodičasto' | 'egzotično'
  description: string
  shortDescription: string
  image: string
  images: string[]
  badge?: 'new' | 'limited' | 'sale'
  prices: {
    weight?: string
    quantity?: number
    price: number
    salePrice?: number
    pricingMode?: 'weight' | 'quantity'
  }[]
  pricingMode?: 'weight' | 'quantity'
  isFavorite: boolean
  stockKg: number
}
