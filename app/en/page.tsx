import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'

export const revalidate = 120

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Premium dehydrated fruit',
  description:
    'Premium dehydrated fruit from Belgrade for cocktails, drink garnish and healthy snacks. Natural, additive-free delivery across Serbia.',
  alternates: {
    canonical: '/en',
    languages: {
      'sr-RS': SITE_URL,
      'en-US': `${SITE_URL}/en`,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    locale: 'en_US',
    url: `${SITE_URL}/en`,
  },
}

export default async function HomePageEn() {
  const initialBestSellers = await getStorefrontProducts('en', {
    bestSellers: true,
    limit: 4,
  }).catch((error) => {
    console.error('Failed to load initial best sellers (en):', error)
    return []
  })

  return <HomePageClient initialBestSellers={initialBestSellers} />
}
