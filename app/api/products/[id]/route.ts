import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [product] = await db
      .select()
      .from(productsTable)
      .where(or(eq(productsTable.id, id), eq(productsTable.slug, id)))
      .limit(1)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
