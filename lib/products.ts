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
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'susena-narandza',
    name: 'Sušena Narandža',
    category: 'citrus',
    shortDescription: 'Savršeni kriškevi za koktel dekoraciju',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🍊',
    images: ['🍊', '🍊', '🍊', '🍊'],
    badge: 'new',
    prices: [
      { weight: '50g', price: 350 },
      { weight: '100g', price: 600 },
      { weight: '1kg', price: 4800 },
      { weight: '3kg', price: 12000 },
    ],
  },
  {
    id: '2',
    slug: 'suseni-limun',
    name: 'Sušeni Limun',
    category: 'citrus',
    shortDescription: 'Intenzivan citrusni ukus',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🍋',
    images: ['🍋', '🍋', '🍋', '🍋'],
    prices: [
      { weight: '50g', price: 320 },
      { weight: '100g', price: 550 },
      { weight: '1kg', price: 4500 },
      { weight: '3kg', price: 11000 },
    ],
  },
  {
    id: '3',
    slug: 'susena-grejpfrut',
    name: 'Sušeni Grejpfrut',
    category: 'citrus',
    shortDescription: 'Gorak i osvežavajući',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🍊',
    images: ['🍊', '🍊', '🍊', '🍊'],
    badge: 'limited',
    prices: [
      { weight: '50g', price: 400 },
      { weight: '100g', price: 700 },
      { weight: '1kg', price: 5500 },
      { weight: '3kg', price: 14000 },
    ],
  },
  {
    id: '4',
    slug: 'susene-jagode',
    name: 'Sušene Jagode',
    category: 'jagodičasto',
    shortDescription: 'Slatke i aromatične',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🍓',
    images: ['🍓', '🍓', '🍓', '🍓'],
    prices: [
      { weight: '50g', price: 450 },
      { weight: '100g', price: 800 },
      { weight: '1kg', price: 6500 },
      { weight: '3kg', price: 17000 },
    ],
  },
  {
    id: '5',
    slug: 'susene-maline',
    name: 'Sušene Maline',
    category: 'jagodičasto',
    shortDescription: 'Premium srpske maline',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🫐',
    images: ['🫐', '🫐', '🫐', '🫐'],
    badge: 'sale',
    prices: [
      { weight: '50g', price: 500, salePrice: 420 },
      { weight: '100g', price: 900, salePrice: 750 },
      { weight: '1kg', price: 7500, salePrice: 6200 },
      { weight: '3kg', price: 20000, salePrice: 16500 },
    ],
  },
  {
    id: '6',
    slug: 'suseni-ananas',
    name: 'Sušeni Ananas',
    category: 'egzotično',
    shortDescription: 'Tropski ukus za koktele',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🍍',
    images: ['🍍', '🍍', '🍍', '🍍'],
    prices: [
      { weight: '50g', price: 380 },
      { weight: '100g', price: 650 },
      { weight: '1kg', price: 5200 },
      { weight: '3kg', price: 13500 },
    ],
  },
  {
    id: '7',
    slug: 'suseni-mango',
    name: 'Sušeni Mango',
    category: 'egzotično',
    shortDescription: 'Sočan i sladak',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🥭',
    images: ['🥭', '🥭', '🥭', '🥭'],
    badge: 'new',
    prices: [
      { weight: '50g', price: 420 },
      { weight: '100g', price: 750 },
      { weight: '1kg', price: 6000 },
      { weight: '3kg', price: 15500 },
    ],
  },
  {
    id: '8',
    slug: 'susena-kivi',
    name: 'Sušena Kivi',
    category: 'egzotično',
    shortDescription: 'Kiselo-slatka kombinacija',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    image: '🥝',
    images: ['🥝', '🥝', '🥝', '🥝'],
    prices: [
      { weight: '50g', price: 360 },
      { weight: '100g', price: 620 },
      { weight: '1kg', price: 5000 },
      { weight: '3kg', price: 13000 },
    ],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') return products
  return products.filter((p) => p.category === category)
}

export function getBestSellers(): Product[] {
  return products.slice(0, 4)
}

export function getSimilarProducts(productId: string): Product[] {
  const product = products.find((p) => p.id === productId)
  if (!product) return products.slice(0, 4)
  return products
    .filter((p) => p.id !== productId && p.category === product.category)
    .slice(0, 4)
}
