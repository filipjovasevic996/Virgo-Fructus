import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'

export const revalidate = 120

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: {
      'sr-RS': SITE_URL,
      'en-US': `${SITE_URL}/en`,
      'x-default': SITE_URL,
    },
  },
}

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
