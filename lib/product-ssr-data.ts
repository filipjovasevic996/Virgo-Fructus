import { db } from '@/lib/db'
import {
  productsTable,
  resolveLocalized,
  type SupportedLocale,
} from '@/lib/db/schema'
import type { Product } from '@/lib/products'
import { parseStockKg } from '@/lib/stock-kg'
import { and, desc, eq } from 'drizzle-orm'

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

export function localizeProductRow(
  product: typeof productsTable.$inferSelect,
  locale: SupportedLocale,
): Product {
  return {
    id: product.id,
    slug: product.slug,
    category: product.category as Product['category'],
    name: resolveLocalized(product.name, locale),
    description: resolveLocalized(product.description, locale),
    shortDescription: resolveLocalized(product.shortDescription, locale),
    image: product.image,
    images: (product.images as string[]) ?? [],
    prices: (product.prices as { weight: string; price: number; salePrice?: number }[]) ?? [],
    badge: product.badge as Product['badge'],
    isFavorite: product.isFavorite,
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
    .orderBy(desc(productsTable.createdAt))
    .limit(5)

  return rows
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => localizeProductRow(p, locale))
}
