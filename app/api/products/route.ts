import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productsTable, resolveLocalized, type SupportedLocale, supportedLocales } from '@/lib/db/schema'
import { parseStockKg } from '@/lib/stock-kg'
import { eq, and, desc } from 'drizzle-orm'

function localizeProduct(product: typeof productsTable.$inferSelect, locale: SupportedLocale) {
  return {
    ...product,
    name: resolveLocalized(product.name, locale),
    description: resolveLocalized(product.description, locale),
    shortDescription: resolveLocalized(product.shortDescription, locale),
    stockKg: parseStockKg(product.stockKg),
  }
}

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const slug = searchParams.get('slug')
    const localeParam = searchParams.get('locale') || 'sr'
    const locale: SupportedLocale = supportedLocales.includes(localeParam as SupportedLocale)
      ? (localeParam as SupportedLocale)
      : 'sr'

    if (searchParams.get('bestSellers') === 'true') {
      const rows = await db
        .select()
        .from(productsTable)
        .where(
          and(eq(productsTable.status, 'active'), eq(productsTable.isFavorite, true)),
        )
        .orderBy(desc(productsTable.createdAt))
        .limit(4)

      return NextResponse.json(
        { products: rows.map((p) => localizeProduct(p, locale)) },
        { headers: CACHE_HEADERS },
      )
    }

    if (slug) {
      const [product] = await db
        .select()
        .from(productsTable)
        .where(and(eq(productsTable.slug, slug), eq(productsTable.status, 'active')))
        .limit(1)

      let similarProducts: typeof productsTable.$inferSelect[] = []
      if (product) {
        similarProducts = await db
          .select()
          .from(productsTable)
          .where(
            and(
              eq(productsTable.status, 'active'),
              eq(productsTable.category, product.category),
            ),
          )
          .orderBy(desc(productsTable.createdAt))
          .limit(5)
      }

      return NextResponse.json(
        {
          product: product ? localizeProduct(product, locale) : null,
          similarProducts: similarProducts
            .filter((p) => !product || p.id !== product.id)
            .slice(0, 4)
            .map((p) => localizeProduct(p, locale)),
        },
        { headers: CACHE_HEADERS },
      )
    }

    let query = db.select().from(productsTable).$dynamic()

    if (category && category !== 'all') {
      query = query.where(and(eq(productsTable.status, 'active'), eq(productsTable.category, category)))
    } else {
      query = query.where(eq(productsTable.status, 'active'))
    }

    const products = await query.orderBy(productsTable.createdAt)
    return NextResponse.json(
      { products: products.map((p) => localizeProduct(p, locale)) },
      { headers: CACHE_HEADERS },
    )
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
