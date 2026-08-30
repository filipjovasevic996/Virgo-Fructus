import { db } from '@/lib/db'
import {
  productsTable,
  resolveLocalized,
  type SupportedLocale,
} from '@/lib/db/schema'
import type { Product } from '@/lib/products'
import { parseStockKg } from '@/lib/stock-kg'
import { and, asc, desc, eq } from 'drizzle-orm'

export async function getProductRow(slug: string) {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.slug, slug), eq(productsTable.status, 'active')))
      .limit(1)
    return product ?? null
  } catch {
    return null
  }
}

export async function getActiveProductSlugs(): Promise<string[]> {
  try {
    const rows = await db
      .select({ slug: productsTable.slug })
      .from(productsTable)
      .where(eq(productsTable.status, 'active'))
    return rows.map((r) => r.slug)
  } catch {
    return []
  }
}

export function localizeProductRow(
  product: typeof productsTable.$inferSelect,
  locale: SupportedLocale,
): Product {
  const prices =
    (product.prices as {
      weight: string
      price: number
      salePrice?: number
      pricingMode?: 'weight' | 'quantity'
    }[]) ?? []

  return {
    id: product.id,
    slug: product.slug,
    category: product.category as Product['category'],
    name: resolveLocalized(product.name, locale),
    description: resolveLocalized(product.description, locale),
    shortDescription: resolveLocalized(product.shortDescription, locale),
    image: product.image,
    images: (product.images as string[]) ?? [],
    prices,
    pricingMode: prices[0]?.pricingMode === 'quantity' ? 'quantity' : 'weight',
    badge: product.badge as Product['badge'],
    isFavorite: product.isFavorite,
    isRegular: product.isRegular ?? true,
    stockKg: parseStockKg(product.stockKg),
  }
}

export async function getSimilarLocalizedProducts(
  product: typeof productsTable.$inferSelect,
  locale: SupportedLocale,
): Promise<Product[]> {
  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(eq(productsTable.status, 'active'), eq(productsTable.category, product.category)),
    )
    .orderBy(asc(productsTable.sortOrder), desc(productsTable.createdAt))
    .limit(5)

  return rows
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => localizeProductRow(p, locale))
}
