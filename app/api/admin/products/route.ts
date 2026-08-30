import { type NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { orderItemsTable, productsTable } from '@/lib/db/schema'
import { asc, desc, eq, notInArray, sql } from 'drizzle-orm'

/**
 * Bust ISR for listing pages, the product detail page when slug is known,
 * and the sitemap (so newly added/activated/deleted products are discoverable
 * to Google without waiting for the 1h sitemap cache to expire).
 */
function revalidateStorefront(productSlug?: string | null) {
  revalidatePath('/')
  revalidatePath('/prodavnica')
  revalidatePath('/en')
  revalidatePath('/en/prodavnica')
  revalidatePath('/sitemap.xml')
  if (productSlug) {
    revalidatePath(`/proizvodi/${productSlug}`)
    revalidatePath(`/en/proizvodi/${productSlug}`)
  }
}

function normalizeStockKg(value: unknown): string {
  const raw =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : Number.NaN
  const kg = Number.isFinite(raw) ? Math.max(0, raw) : 1000
  const rounded = Math.ceil(kg * 10000) / 10000
  return rounded.toFixed(4)
}

function ensureLocalized(value: unknown): { sr: string; en: string } {
  if (typeof value === 'string') return { sr: value, en: '' }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, string>
    return { sr: obj.sr || '', en: obj.en || '' }
  }
  return { sr: '', en: '' }
}

export async function GET() {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(asc(productsTable.sortOrder), desc(productsTable.createdAt))
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.slug || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, category' },
        { status: 400 }
      )
    }

    // New products go to the top of the manual ordering, matching the
    // newest-first behaviour the admin list had before ordering existed.
    const [{ minSortOrder }] = await db
      .select({ minSortOrder: sql<number | null>`min(${productsTable.sortOrder})` })
      .from(productsTable)

    const [product] = await db
      .insert(productsTable)
      .values({
        name: ensureLocalized(body.name),
        slug: body.slug,
        category: body.category,
        description: ensureLocalized(body.description),
        shortDescription: ensureLocalized(body.shortDescription),
        image: body.image || '',
        images: body.images || [],
        badge: body.badge || null,
        status: body.status || 'active',
        prices: body.prices || [],
        isFavorite: Boolean(body.isFavorite),
        isRegular: body.isRegular === undefined ? true : Boolean(body.isRegular),
        sortOrder: (minSortOrder ?? 1) - 1,
        stockKg: normalizeStockKg(body.stockKg ?? body.stockGrams),
      })
      .returning()

    revalidateStorefront(product.slug)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name !== undefined) updates.name = ensureLocalized(body.name)
    if (body.slug !== undefined) updates.slug = body.slug
    if (body.category !== undefined) updates.category = body.category
    if (body.description !== undefined) updates.description = ensureLocalized(body.description)
    if (body.shortDescription !== undefined) updates.shortDescription = ensureLocalized(body.shortDescription)
    if (body.image !== undefined) updates.image = body.image
    if (body.images !== undefined) updates.images = body.images
    if (body.badge !== undefined) updates.badge = body.badge || null
    if (body.status !== undefined) updates.status = body.status
    if (body.prices !== undefined) updates.prices = body.prices
    if (body.stockKg !== undefined || body.stockGrams !== undefined) {
      updates.stockKg = normalizeStockKg(body.stockKg ?? body.stockGrams)
    }
    if (body.isFavorite !== undefined) updates.isFavorite = Boolean(body.isFavorite)
    if (body.isRegular !== undefined) updates.isRegular = Boolean(body.isRegular)

    const [product] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, body.id))
      .returning()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    revalidateStorefront(product.slug)

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

/**
 * Persists the manual storefront ordering.
 * Body: `{ order: string[] }` — product ids in the exact order they should be
 * shown. Ids missing from the payload keep their current position relative to
 * each other, after the listed ones.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const order: unknown = body?.order

    if (!Array.isArray(order) || order.some((id) => typeof id !== 'string')) {
      return NextResponse.json(
        { error: 'Body must be `{ order: string[] }`' },
        { status: 400 }
      )
    }

    const ids = order as string[]
    if (ids.length === 0) {
      return NextResponse.json({ success: true })
    }

    await db.transaction(async (tx) => {
      // Push everything not in the payload behind the reordered block so the
      // two groups can never interleave.
      await tx
        .update(productsTable)
        .set({
          sortOrder: sql`greatest(${productsTable.sortOrder}, 0) + ${ids.length}`,
        })
        .where(notInArray(productsTable.id, ids))

      for (const [index, id] of ids.entries()) {
        await tx
          .update(productsTable)
          .set({ sortOrder: index })
          .where(eq(productsTable.id, id))
      }
    })

    revalidateStorefront()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering products:', error)
    return NextResponse.json({ error: 'Failed to reorder products' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const deleted = await db.transaction(async (tx) => {
      // Order history outlives the catalog: line items keep their product
      // name/price snapshot and simply lose the reference. Without this the
      // FK on `order_items.product_id` makes DELETE fail with 23503 for every
      // product that has ever been ordered.
      await tx
        .update(orderItemsTable)
        .set({ productId: null })
        .where(eq(orderItemsTable.productId, id))

      const [row] = await tx
        .delete(productsTable)
        .where(eq(productsTable.id, id))
        .returning()

      return row
    })

    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    revalidateStorefront(deleted.slug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    const code = (error as { code?: string })?.code
    // 23502 = order_items.product_id is still NOT NULL, i.e. the migration in
    // drizzle/manual/0002_product_ordering_display_and_delete.sql (or
    // `pnpm db:push`) has not been applied to this database yet.
    if (code === '23502') {
      console.error(
        'order_items.product_id is still NOT NULL — apply drizzle/manual/0002_product_ordering_display_and_delete.sql or run `pnpm db:push`.',
      )
    }
    // 23503 = foreign key violation: something else still references the
    // product. Surface it as a conflict instead of an opaque 500.
    if (code === '23503') {
      return NextResponse.json(
        {
          error:
            'Proizvod je povezan sa postojećim porudžbinama i ne može biti obrisan. Sakrijte ga umesto brisanja.',
        },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
