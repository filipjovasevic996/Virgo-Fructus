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
    weight: string
    price: number
    salePrice?: number
  }[]
  isFavorite: boolean
  stockKg: number
}
