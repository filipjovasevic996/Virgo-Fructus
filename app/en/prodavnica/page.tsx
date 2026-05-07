import type { Metadata } from 'next'
import { ShopPageClient } from '@/components/shop-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const revalidate = 120

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse premium dehydrated fruit from Vigor Fructus — lime, lemon, blood orange and more for cocktails and snacks.',
  alternates: {
    canonical: '/en/prodavnica',
    languages: buildLanguageAlternates('/prodavnica'),
  },
  openGraph: {
    type: 'website',
    title: 'Shop | Vigor Fructus',
    description: 'All products and pack sizes — premium dehydrated fruit.',
    url: `${SITE_URL}/en/prodavnica`,
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/prodavnica/opengraph-image`, width: 1200, height: 630, alt: 'Shop' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop | Vigor Fructus',
    description: 'Browse premium dehydrated fruit and pack sizes.',
    images: [`${SITE_URL}/prodavnica/opengraph-image`],
  },
}

export default async function ShopPageEn() {
  const initialProducts = await getStorefrontProducts('en').catch((error) => {
    console.error('Failed to load initial storefront products (en):', error)
    return []
  })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/en/prodavnica` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ShopPageClient initialProducts={initialProducts} />
    </>
  )
}
