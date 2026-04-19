import { HomePageClient } from '@/components/home-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'

export const revalidate = 120

export default async function HomePage() {
  const initialBestSellers = await getStorefrontProducts('sr', {
    bestSellers: true,
    limit: 4,
  }).catch((error) => {
    console.error('Failed to load initial best sellers:', error)
    return []
  })

  return <HomePageClient initialBestSellers={initialBestSellers} />
}
