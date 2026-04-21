import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { parseStockKg } from '@/lib/stock-kg'
import { inArray } from 'drizzle-orm'

/** Lightweight stock lookup for cart clamping (public). */
export async function GET(request: Request) {
  try {
    const ids =
      new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean) ?? []
    if (ids.length === 0) {
      return NextResponse.json({ stock: {} as Record<string, number> })
    }

    const rows = await db
      .select({
        id: productsTable.id,
        stockKg: productsTable.stockKg,
      })
      .from(productsTable)
      .where(inArray(productsTable.id, ids))

    const stock: Record<string, number> = {}
    for (const row of rows) {
      stock[row.id] = parseStockKg(row.stockKg)
    }

    return NextResponse.json({ stock })
  } catch (error) {
    console.error('Stock fetch error:', error)
    return NextResponse.json({ error: 'Failed to load stock' }, { status: 500 })
  }
}
