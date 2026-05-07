import type { Metadata } from 'next'
import { resolveLocalized } from '@/lib/db/schema'
import { allResolvedProductImageUrls } from '@/lib/resolve-product-image-url'
import ProductDetail from '@/components/product-detail'
import { notFound } from 'next/navigation'
import { parseWeightToGrams } from '@/lib/parse-weight-grams'
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

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com'
).replace(/\/+$/, '')

type Props = {
  params: Promise<{ slug: string }>
}

/**
 * Pre-render every active product page at build time. Combined with
 * `revalidate`, new/updated products are picked up on the next ISR refresh.
 */
export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const revalidate = 120

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductRow(slug)

  if (!product) {
    return { title: 'Product not found' }
  }

  const name = resolveLocalized(product.name, 'en')
  const shortDesc = resolveLocalized(product.shortDescription, 'en')
  const description = resolveLocalized(product.description, 'en')
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
  const enPath = `/en/proizvodi/${slug}`

  const fallbackDescription =
    typeof lowestPrice === 'number'
      ? `${name} – premium dehydrated fruit. From ${lowestPrice} RSD.`
      : `${name} – premium dehydrated fruit for cocktails and healthy snacks.`

  return {
    title: name,
    description: shortDesc || description || fallbackDescription,
    alternates: {
      canonical: enPath,
      languages: {
        'sr-RS': `${SITE_URL}${srPath}`,
        'en-US': `${SITE_URL}${enPath}`,
        'x-default': `${SITE_URL}${srPath}`,
      },
    },
    openGraph: {
      title: `${name} | Vigor Fructus`,
      description:
        shortDesc ||
        `${name} – premium dehydrated fruit for cocktails.`,
      url: enPath,
      locale: 'en_US',
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

export default async function ProductPageEn({ params }: Props) {
  const { slug } = await params
  const product = await getProductRow(slug)
  if (!product) notFound()

  const localizedProduct = localizeProductRow(product, 'en')
  const similarProducts = await getSimilarLocalizedProducts(product, 'en')
  const name = localizedProduct.name
  const description = localizedProduct.description
  const resolvedImages = allResolvedProductImageUrls(product.images, product.image, SITE_URL)
  const sku = `VF-${product.id}`
  const productUrl = `${SITE_URL}/en/proizvodi/${slug}`
  const offerEntries = validPriceEntries(localizedProduct.prices).map((p) => {
    const grams = parseWeightToGrams(p.weight) ?? 0
    const inStock =
      grams > 0
        ? localizedProduct.stockKg * 1000 >= grams
        : localizedProduct.stockKg > 0
    return {
      '@type': 'Offer',
      sku: `${sku}-${p.weight}`,
      name: p.weight,
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
        name: 'Shop',
        item: `${SITE_URL}/en/prodavnica`,
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
        locale="en"
      />
    </>
  )
}
