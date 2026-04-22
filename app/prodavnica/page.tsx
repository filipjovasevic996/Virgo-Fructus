import type { Metadata } from 'next'
import { ShopPageClient } from '@/components/shop-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'

export const revalidate = 120
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

export const metadata: Metadata = {
  title: 'Prodavnica',
  description:
    'Kupite premium dehidrirano voce Vigor Fructus: limeta, limun, crvena pomorandza i drugi proizvodi za koktele i zdravu uzinu.',
  alternates: { canonical: '/prodavnica' },
  openGraph: {
    type: 'website',
    title: 'Prodavnica | Vigor Fructus',
    description:
      'Pregled svih proizvoda i pakovanja premium dehidriranog voca Vigor Fructus.',
    url: `${SITE_URL}/prodavnica`,
    images: [{ url: `${SITE_URL}/prodavnica/opengraph-image`, width: 1200, height: 630, alt: 'Prodavnica' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prodavnica | Vigor Fructus',
    description: 'Pregled svih proizvoda i pakovanja premium dehidriranog voca Vigor Fructus.',
    images: [`${SITE_URL}/prodavnica/opengraph-image`],
  },
}

export default async function ShopPage() {
  const initialProducts = await getStorefrontProducts('sr').catch((error) => {
    console.error('Failed to load initial storefront products:', error)
    return []
  })
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Prodavnica', item: `${SITE_URL}/prodavnica` },
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
