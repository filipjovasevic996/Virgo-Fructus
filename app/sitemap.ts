import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { firstResolvedProductImage } from '@/lib/resolve-product-image-url'
import { desc, eq } from 'drizzle-orm'
import { PRODUCT_CATEGORIES, categoryPath } from '@/lib/categories'

/** Cache sitemap generation (reduces DB hits when crawlers poll /sitemap.xml often) */
export const revalidate = 3600

function normalizeSiteUrl(raw: string) {
  return raw.replace(/\/+$/, '').trim()
}

const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com',
)

type StaticEntry = {
  path: string
  priority: number
  frequency: NonNullable<MetadataRoute.Sitemap[0]['changeFrequency']>
}

const STATIC_DEFS: StaticEntry[] = [
  { path: '', frequency: 'weekly', priority: 1 },
  { path: '/prodavnica', frequency: 'weekly', priority: 0.9 },
  { path: '/nasa-prica', frequency: 'monthly', priority: 0.7 },
  { path: '/kontakt', frequency: 'monthly', priority: 0.6 },
  { path: '/faq', frequency: 'monthly', priority: 0.6 },
  { path: '/uslovi-kupovine', frequency: 'monthly', priority: 0.5 },
  { path: '/povrat-robe-i-reklamacije', frequency: 'monthly', priority: 0.5 },
  { path: '/politika-privatnosti', frequency: 'monthly', priority: 0.5 },
]

/**
 * Bidirectional language map for one logical page (SR ↔ EN).
 * Repeating the same map on both URL entries lets Google connect them
 * as alternates regardless of which one it crawls first.
 */
function languageMap(srUrl: string, enUrl: string) {
  return {
    sr: srUrl,
    en: enUrl,
    'x-default': srUrl,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = STATIC_DEFS.flatMap((def) => {
    const srUrl = `${SITE_URL}${def.path || '/'}`
    const enUrl = `${SITE_URL}/en${def.path || ''}`
    const languages = languageMap(srUrl, enUrl)
    const enPriority = Math.max(0.3, def.priority - 0.05)
    return [
      {
        url: srUrl,
        lastModified: now,
        changeFrequency: def.frequency,
        priority: def.priority,
        alternates: { languages },
      },
      {
        url: enUrl,
        lastModified: now,
        changeFrequency: def.frequency,
        priority: enPriority,
        alternates: { languages },
      },
    ]
  })

  let productPages: MetadataRoute.Sitemap = []
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const products = await db
      .select({
        slug: productsTable.slug,
        category: productsTable.category,
        updatedAt: productsTable.updatedAt,
        images: productsTable.images,
        image: productsTable.image,
      })
      .from(productsTable)
      .where(eq(productsTable.status, 'active'))
      .orderBy(desc(productsTable.updatedAt))

    productPages = products.flatMap((p) => {
      const pathSlug = encodeURIComponent(p.slug)
      const img = firstResolvedProductImage(p.images, p.image, SITE_URL)
      const srUrl = `${SITE_URL}/proizvodi/${pathSlug}`
      const enUrl = `${SITE_URL}/en/proizvodi/${pathSlug}`
      const languages = languageMap(srUrl, enUrl)

      const srEntry: MetadataRoute.Sitemap[0] = {
        url: srUrl,
        lastModified: p.updatedAt ?? now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages },
      }
      const enEntry: MetadataRoute.Sitemap[0] = {
        url: enUrl,
        lastModified: p.updatedAt ?? now,
        changeFrequency: 'weekly',
        priority: 0.75,
        alternates: { languages },
      }
      if (img) {
        srEntry.images = [img]
        enEntry.images = [img]
      }
      return [srEntry, enEntry]
    })

    // Samo kategorije koje trenutno imaju aktivne proizvode (npr. novogodišnja
    // kolekcija van sezone ne ulazi u sitemap dok je prazna).
    categoryPages = PRODUCT_CATEGORIES.flatMap((category) => {
      const inCategory = products.filter((p) => p.category === category.slug)
      if (inCategory.length === 0) return []
      const lastModified = inCategory[0].updatedAt ?? now
      const path = categoryPath(category.slug)
      const srUrl = `${SITE_URL}${path}`
      const enUrl = `${SITE_URL}/en${path}`
      const languages = languageMap(srUrl, enUrl)
      return [
        { url: srUrl, lastModified, changeFrequency: 'weekly' as const, priority: 0.85, alternates: { languages } },
        { url: enUrl, lastModified, changeFrequency: 'weekly' as const, priority: 0.8, alternates: { languages } },
      ]
    })
  } catch {
    // DB may not be available during build
  }

  return [...staticPages, ...categoryPages, ...productPages]
}
