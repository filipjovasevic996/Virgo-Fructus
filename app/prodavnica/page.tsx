import { ShopPageClient } from '@/components/shop-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'

export const revalidate = 120

export default async function ShopPage() {
  const initialProducts = await getStorefrontProducts('sr').catch((error) => {
    console.error('Failed to load initial storefront products:', error)
    return []
  })
  return <ShopPageClient initialProducts={initialProducts} />
}
