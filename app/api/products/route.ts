import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productsTable, resolveLocalized, type SupportedLocale, supportedLocales } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

function localizeProduct(product: typeof productsTable.$inferSelect, locale: SupportedLocale) {
  return {
    ...product,
    name: resolveLocalized(product.name, locale),
    description: resolveLocalized(product.description, locale),
    shortDescription: resolveLocalized(product.shortDescription, locale),
  }
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

    if (slug) {
      const [product] = await db
        .select()
        .from(productsTable)
        .where(and(eq(productsTable.slug, slug), eq(productsTable.status, 'active')))
        .limit(1)

      return NextResponse.json({
        product: product ? localizeProduct(product, locale) : null,
      })
    }

    let query = db.select().from(productsTable).$dynamic()

    if (category && category !== 'all') {
      query = query.where(and(eq(productsTable.status, 'active'), eq(productsTable.category, category)))
    } else {
      query = query.where(eq(productsTable.status, 'active'))
    }

    const products = await query.orderBy(productsTable.createdAt)
    return NextResponse.json({
      products: products.map((p) => localizeProduct(p, locale)),
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
