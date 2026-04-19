import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  productsTable,
  resolveLocalized,
  supportedLocales,
  type SupportedLocale,
} from '@/lib/db/schema'
import type { Product } from '@/lib/products'

function normalizeLocale(locale: string): SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'sr'
}

function localizeProduct(
  product: typeof productsTable.$inferSelect,
  locale: SupportedLocale,
): Product {
  return {
    ...product,
    name: resolveLocalized(product.name, locale),
    description: resolveLocalized(product.description, locale),
    shortDescription: resolveLocalized(product.shortDescription, locale),
    image: product.image,
    images: (product.images as string[]) ?? [],
    prices:
      (product.prices as { weight: string; price: number; salePrice?: number }[]) ?? [],
  } as Product
}

export async function getStorefrontProducts(
  localeInput: string,
  opts?: { bestSellers?: boolean; limit?: number },
): Promise<Product[]> {
  const locale = normalizeLocale(localeInput)
  const limit = opts?.limit
  const whereClause = opts?.bestSellers
    ? and(eq(productsTable.status, 'active'), eq(productsTable.isFavorite, true))
    : eq(productsTable.status, 'active')

  const query = db
    .select()
    .from(productsTable)
    .where(whereClause)
    .orderBy(desc(productsTable.createdAt))
    .$dynamic()

  const rows = typeof limit === 'number' ? await query.limit(limit) : await query
  return rows.map((row) => localizeProduct(row, locale))
}
