import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vigorfructus.rs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/prodavnica`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/nasa-prica`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  let productPages: MetadataRoute.Sitemap = []
  try {
    const products = await db
      .select({ slug: productsTable.slug, updatedAt: productsTable.updatedAt })
      .from(productsTable)
      // @ts-expect-error — dual drizzle-orm instances from pnpm hoisting
      .where(sql`${productsTable.status} = 'active'`)

    productPages = products.map((p) => ({
      url: `${SITE_URL}/proizvodi/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB may not be available during build
  }

  return [...staticPages, ...productPages]
}
