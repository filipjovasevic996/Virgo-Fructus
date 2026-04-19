import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

/** Cache sitemap generation (reduces DB hits when crawlers poll /sitemap.xml often) */
export const revalidate = 3600

function normalizeSiteUrl(raw: string) {
  return raw.replace(/\/+$/, '').trim()
}

const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vigorfructus.com',
)

function resolveAbsoluteImageUrl(src: string): string | undefined {
  const s = src.trim()
  if (!s) return undefined
  if (s.startsWith('https://') || s.startsWith('http://')) return s
  if (s.startsWith('/')) return `${SITE_URL}${s}`
  return undefined
}

function primaryProductImage(images: unknown): string | undefined {
  if (!Array.isArray(images)) return undefined
  for (const img of images) {
    if (typeof img !== 'string') continue
    const url = resolveAbsoluteImageUrl(img)
    if (url) return url
  }
  return undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/prodavnica`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/nasa-prica`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/kontakt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await db
      .select({
        slug: productsTable.slug,
        updatedAt: productsTable.updatedAt,
        images: productsTable.images,
      })
      .from(productsTable)
      .where(eq(productsTable.status, 'active'))
      .orderBy(desc(productsTable.updatedAt))

    productPages = products.map((p) => {
      const pathSlug = encodeURIComponent(p.slug)
      const entry: MetadataRoute.Sitemap[0] = {
        url: `${SITE_URL}/proizvodi/${pathSlug}`,
        lastModified: p.updatedAt ?? now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }
      const img = primaryProductImage(p.images)
      if (img) {
        entry.images = [img]
      }
      return entry
    })
  } catch {
    // DB may not be available during build
  }

  return [...staticPages, ...productPages]
}
