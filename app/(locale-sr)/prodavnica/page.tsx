import type { Metadata } from 'next'
import { cache } from 'react'
import { ShopPageClient } from '@/components/shop-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'
import { buildLanguageAlternates } from '@/lib/hreflang'

export const revalidate = 120
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(/\/+$/, '')

/**
 * React-cached so `generateMetadata` and the default export share the same DB
 * read within a single request. Avoids two DB hits per shop page render.
 */
const loadShopProducts = cache(() =>
  getStorefrontProducts('sr').catch((error) => {
    console.error('Failed to load initial storefront products:', error)
    return []
  }),
)

/**
 * "Dehidrirana limeta" → "limeta"; "Dehidrirani đumbir" → "đumbir".
 * Strips the redundant "Dehidrirana/i/o" prefix so the meta description can
 * fit every product name without repeating the same word 11 times.
 */
function shortProductName(name: string): string {
  return name.replace(/^Dehidrira(?:n[aio])\s+/i, '').trim()
}

export async function generateMetadata(): Promise<Metadata> {
  const products = await loadShopProducts()
  const lead =
    'Kupite premium dehidrirano voće iz Beograda — 100% prirodno, bez aditiva i konzervansa. Besplatna dostava u Srbiji za narudžbine preko 2500 RSD.'
  const description = products.length
    ? `${lead} U ponudi: ${products.map((p) => shortProductName(p.name)).join(', ')}.`
    : lead

  return {
    title: 'Prodavnica dehidriranog voća',
    description,
    alternates: {
      canonical: '/prodavnica',
      languages: buildLanguageAlternates('/prodavnica'),
    },
    openGraph: {
      type: 'website',
      title: 'Prodavnica dehidriranog voća | Vigor Fructus',
      description: products.length
        ? `Sve sorte premium dehidriranog voća Vigor Fructus iz Beograda: ${products
            .map((p) => shortProductName(p.name))
            .join(', ')}.`
        : 'Pregled svih proizvoda i pakovanja premium dehidriranog voća Vigor Fructus.',
      url: `${SITE_URL}/prodavnica`,
      images: [
        {
          url: `${SITE_URL}/prodavnica/opengraph-image`,
          width: 1200,
          height: 630,
          alt: 'Prodavnica dehidriranog voća Vigor Fructus',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Prodavnica dehidriranog voća | Vigor Fructus',
      description: products.length
        ? `Sve sorte premium dehidriranog voća Vigor Fructus iz Beograda: ${products
            .map((p) => shortProductName(p.name))
            .join(', ')}.`
        : 'Pregled svih proizvoda i pakovanja premium dehidriranog voća Vigor Fructus.',
      images: [`${SITE_URL}/prodavnica/opengraph-image`],
    },
  }
}

export default async function ShopPage() {
  const initialProducts = await loadShopProducts()
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Naslovna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Prodavnica', item: `${SITE_URL}/prodavnica` },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Prodavnica dehidriranog voća — Vigor Fructus',
    url: `${SITE_URL}/prodavnica`,
    numberOfItems: initialProducts.length,
    itemListElement: initialProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/proizvodi/${product.slug}`,
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
