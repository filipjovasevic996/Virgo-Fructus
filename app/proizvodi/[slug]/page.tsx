import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { productsTable, resolveLocalized } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import ProductDetail from '@/components/product-detail'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vigorfructus.rs'

type Props = {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(sql`${productsTable.slug} = ${slug} AND ${productsTable.status} = 'active'`)
      .limit(1)
    return product ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: 'Proizvod nije pronađen' }
  }

  const name = resolveLocalized(product.name, 'sr')
  const shortDesc = resolveLocalized(product.shortDescription, 'sr')
  const description = resolveLocalized(product.description, 'sr')
  const images = product.images as string[]
  const prices = product.prices as { weight: string; price: number; salePrice?: number }[]
  const lowestPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.salePrice ?? p.price)) : 0

  return {
    title: name,
    description:
      shortDesc ||
      description ||
      `${name} – premium dehidrirano voće. Od ${lowestPrice} RSD.`,
    alternates: { canonical: `/proizvodi/${slug}` },
    openGraph: {
      title: `${name} | Vigor Fructus`,
      description:
        shortDesc ||
        `${name} – premium dehidrirano voće za koktele.`,
      url: `/proizvodi/${slug}`,
      type: 'website',
      images: images
        .filter((img) => img.startsWith('http'))
        .map((img) => ({ url: img, alt: name })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | Vigor Fructus`,
      description: shortDesc || description,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  const name = resolveLocalized(product?.name, 'sr')
  const description = resolveLocalized(product?.description, 'sr')
  const prices = (product?.prices ?? []) as { weight: string; price: number; salePrice?: number }[]
  const images = (product?.images ?? []) as string[]

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image: images.filter((img) => img.startsWith('http')),
        url: `${SITE_URL}/proizvodi/${slug}`,
        brand: {
          '@type': 'Brand',
          name: 'Vigor Fructus',
        },
        offers: prices.map((p) => ({
          '@type': 'Offer',
          price: p.salePrice ?? p.price,
          priceCurrency: 'RSD',
          availability: 'https://schema.org/InStock',
          name: p.weight,
        })),
        breadcrumb: {
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
              item: `${SITE_URL}/proizvodi/${slug}`,
            },
          ],
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetail />
    </>
  )
}
