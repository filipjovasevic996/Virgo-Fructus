import type { Metadata } from 'next'
import { resolveLocalized } from '@/lib/db/schema'
import { allResolvedProductImageUrls } from '@/lib/resolve-product-image-url'
import ProductDetail from '@/components/product-detail'
import { notFound } from 'next/navigation'
import { parseWeightToGrams } from '@/lib/parse-weight-grams'
import { priceEntryLabel, priceEntryKey } from '@/lib/price-entry-label'
import {
  getActiveProductSlugs,
  getProductRow,
  localizeProductRow,
  getSimilarLocalizedProducts,
} from '@/lib/product-ssr-data'
import {
  type PriceEntry,
  effectivePrice,
  lowestEffectivePrice,
  validPriceEntries,
} from '@/lib/product-offers'
import { buildLanguageAlternates } from '@/lib/hreflang'

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'
).replace(/\/+$/, '')

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const revalidate = 120

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductRow(slug)

  if (!product) {
    return { title: 'Proizvod nije pronađen' }
  }

  const name = resolveLocalized(product.name, 'sr')
  const shortDesc = resolveLocalized(product.shortDescription, 'sr')
  const description = resolveLocalized(product.description, 'sr')
  const resolvedImages = allResolvedProductImageUrls(
    product.images,
    product.image,
    SITE_URL,
  )
  const prices = product.prices as PriceEntry[]
  const lowestPrice = lowestEffectivePrice(prices)
  const offerPrice = effectivePrice(validPriceEntries(prices)[0])
  const availability = product.stockKg && Number(product.stockKg) > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const sku = `VF-${product.id}`

  const srPath = `/proizvodi/${slug}`

  const fallbackDescription =
    typeof lowestPrice === 'number'
      ? `${name} – premium dehidrirano voće. Od ${lowestPrice} RSD.`
      : `${name} – premium dehidrirano voće za koktele i zdravu užinu.`

  return {
    title: name,
    description: shortDesc || description || fallbackDescription,
    alternates: {
      canonical: srPath,
      languages: buildLanguageAlternates(srPath),
    },
    openGraph: {
      title: `${name} | Vigor Fructus`,
      description:
        shortDesc ||
        `${name} – premium dehidrirano voće za koktele.`,
      url: srPath,
      locale: 'sr_RS',
      type: 'website',
      images: resolvedImages.map((img) => ({ url: img, alt: name })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Vigor Fructus`,
      description: shortDesc || description,
    },
    other: {
      ...(typeof offerPrice === 'number' ? { 'product:price:amount': String(offerPrice) } : {}),
      'product:price:currency': 'RSD',
      'product:availability': availability,
      'product:retailer_item_id': sku,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductRow(slug)
  if (!product) notFound()

  const localizedProduct = localizeProductRow(product, 'sr')
  const similarProducts = await getSimilarLocalizedProducts(product, 'sr')
  const name = localizedProduct.name
  const description = localizedProduct.description
  const resolvedImages = allResolvedProductImageUrls(product.images, product.image, SITE_URL)
  const sku = `VF-${product.id}`
  const productUrl = `${SITE_URL}/proizvodi/${slug}`

  // Only emit Offers for variants with a real, positive price. Google's
  // Product rich-result validator rejects offers with `price: 0`, which
  // disqualifies the entire product from price/availability cards.
  const offerEntries = validPriceEntries(localizedProduct.prices).map((p) => {
    const label = priceEntryLabel(p)
    const grams = parseWeightToGrams(p.weight ?? '') ?? 0
    const inStock =
      grams > 0
        ? localizedProduct.stockKg * 1000 >= grams
        : localizedProduct.stockKg > 0
    return {
      '@type': 'Offer',
      sku: `${sku}-${priceEntryKey(p)}`,
      name: label,
      price: effectivePrice(p) as number,
      priceCurrency: 'RSD',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: productUrl,
      seller: { '@id': `${SITE_URL}/#organization` },
    }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name,
    description: description || localizedProduct.shortDescription,
    sku,
    image: resolvedImages,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      '@id': `${SITE_URL}/#organization`,
      name: 'Vigor Fructus',
    },
    manufacturer: {
      '@id': `${SITE_URL}/#organization`,
    },
    ...(offerEntries.length > 0 ? { offers: offerEntries } : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Prodavnica',
        item: `${SITE_URL}/prodavnica`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name,
        item: productUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail
        product={localizedProduct}
        similarProducts={similarProducts}
        locale="sr"
      />
    </>
  )
}
