import type { Metadata } from 'next'
import { cache } from 'react'
import { ShopPageClient } from '@/components/shop-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const revalidate = 120

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

/**
 * React-cached so `generateMetadata` and the default export share the same DB
 * read within a single request. Mirrors the SR variant.
 */
const loadShopProductsEn = cache(() =>
  getStorefrontProducts('en').catch((error) => {
    console.error('Failed to load initial storefront products (en):', error)
    return []
  }),
)

/** "Dehydrated lime" → "lime". Keeps the meta description compact. */
function shortProductName(name: string): string {
  return name.replace(/^Dehydrated\s+/i, '').trim()
}

export async function generateMetadata(): Promise<Metadata> {
  const products = await loadShopProductsEn()
  const lead =
    'Buy premium dehydrated fruit from Belgrade — 100% natural, additive-free, no preservatives. Free delivery across Serbia for orders over 4000 RSD.'
  const description = products.length
    ? `${lead} Available: ${products.map((p) => shortProductName(p.name)).join(', ')}.`
    : lead

  return {
    title: 'Dehydrated fruit shop',
    description,
    alternates: {
      canonical: '/en/prodavnica',
      languages: buildLanguageAlternates('/prodavnica'),
    },
    openGraph: {
      type: 'website',
      title: 'Dehydrated fruit shop | Vigor Fructus',
      description: products.length
        ? `All Vigor Fructus dehydrated fruit varieties from Belgrade: ${products
            .map((p) => shortProductName(p.name))
            .join(', ')}.`
        : 'All products and pack sizes — premium dehydrated fruit from Belgrade.',
      url: `${SITE_URL}/en/prodavnica`,
      locale: 'en_US',
      images: [
        {
          url: `${SITE_URL}/prodavnica/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Vigor Fructus dehydrated fruit shop',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Dehydrated fruit shop | Vigor Fructus',
      description: products.length
        ? `All Vigor Fructus dehydrated fruit varieties from Belgrade: ${products
            .map((p) => shortProductName(p.name))
            .join(', ')}.`
        : 'Browse premium dehydrated fruit and pack sizes.',
      images: [`${SITE_URL}/prodavnica/opengraph-image`],
    },
  }
}

export default async function ShopPageEn() {
  const initialProducts = await loadShopProductsEn()

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/en/prodavnica` },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dehydrated fruit shop — Vigor Fructus',
    url: `${SITE_URL}/en/prodavnica`,
    numberOfItems: initialProducts.length,
    itemListElement: initialProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/en/proizvodi/${product.slug}`,
      name: product.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ShopPageClient initialProducts={initialProducts} />
    </>
  )
}
