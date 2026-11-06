import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { ShopPageClient } from '@/components/shop-page-client'
import { getStorefrontProducts } from '@/lib/storefront-products'
import { buildLanguageAlternates } from '@/lib/hreflang'
import {
  PRODUCT_CATEGORY_SLUGS,
  categoryPath,
  getProductCategory,
  isProductCategory,
} from '@/lib/categories'

/**
 * Zajednička logika za stranice kategorija u oba jezika
 * (`app/(locale-sr)/prodavnica/[kategorija]` i `app/en/prodavnica/[kategorija]`).
 */

type Locale = 'sr' | 'en'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com').replace(
  /\/+$/,
  '',
)

const COPY = {
  sr: {
    home: 'Naslovna',
    shop: 'Prodavnica',
    ogLocale: 'sr_RS',
    available: 'U ponudi',
  },
  en: {
    home: 'Home',
    shop: 'Shop',
    ogLocale: 'en_US',
    available: 'Available',
  },
} as const

export type CategoryPageProps = {
  params: Promise<{ kategorija: string }>
}

export function categoryStaticParams() {
  return PRODUCT_CATEGORY_SLUGS.map((kategorija) => ({ kategorija }))
}

/** Deli isti DB upit između generateMetadata i same stranice u okviru jednog rendera. */
const loadProducts = cache((locale: Locale) =>
  getStorefrontProducts(locale).catch((error) => {
    console.error(`Failed to load storefront products (${locale}):`, error)
    return []
  }),
)

function localePrefix(locale: Locale) {
  return locale === 'en' ? '/en' : ''
}

export async function buildCategoryMetadata(
  locale: Locale,
  { params }: CategoryPageProps,
): Promise<Metadata> {
  const { kategorija } = await params
  const category = getProductCategory(kategorija)
  if (!category) return {}

  const products = (await loadProducts(locale)).filter((p) => p.category === category.slug)
  const path = categoryPath(category.slug)
  const url = `${SITE_URL}${localePrefix(locale)}${path}`
  const heading = category.heading[locale]
  const description = products.length
    ? `${category.description[locale]} ${COPY[locale].available}: ${products
        .map((p) => p.name)
        .join(', ')}.`
    : category.description[locale]
  const ogImage = `${SITE_URL}/prodavnica/opengraph-image`

  return {
    title: heading,
    description,
    alternates: {
      canonical: `${localePrefix(locale)}${path}`,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      type: 'website',
      title: `${heading} | Vigor Fructus`,
      description: category.description[locale],
      url,
      locale: COPY[locale].ogLocale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: heading }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${heading} | Vigor Fructus`,
      description: category.description[locale],
      images: [ogImage],
    },
  }
}

export async function CategoryPage({
  locale,
  params,
}: CategoryPageProps & { locale: Locale }) {
  const { kategorija } = await params
  if (!isProductCategory(kategorija)) notFound()
  const category = getProductCategory(kategorija)!

  // Klijent dobija sve proizvode (za brojeve na dugmićima kategorija) i sam filtrira.
  const allProducts = await loadProducts(locale)
  const products = allProducts.filter((p) => p.category === category.slug)

  const prefix = localePrefix(locale)
  const shopUrl = `${SITE_URL}${prefix}/prodavnica`
  const url = `${SITE_URL}${prefix}${categoryPath(category.slug)}`
  const heading = category.heading[locale]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: COPY[locale].home, item: `${SITE_URL}${prefix || '/'}` },
      { '@type': 'ListItem', position: 2, name: COPY[locale].shop, item: shopUrl },
      { '@type': 'ListItem', position: 3, name: heading, item: url },
    ],
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: `${heading} — Vigor Fructus`,
    description: category.description[locale],
    url,
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}${prefix}/proizvodi/${product.slug}`,
        name: product.name,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ShopPageClient initialProducts={allProducts} activeCategory={category.slug} />
    </>
  )
}
