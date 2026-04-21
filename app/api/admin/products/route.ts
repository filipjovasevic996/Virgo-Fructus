import { type NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

/** Bust ISR for listing pages; optionally the product detail page when slug is known */
function revalidateStorefront(productSlug?: string | null) {
  revalidatePath('/')
  revalidatePath('/prodavnica')
  if (productSlug) {
    revalidatePath(`/proizvodi/${productSlug}`)
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
    const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt))
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const [deleted] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    revalidateStorefront(deleted.slug)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
