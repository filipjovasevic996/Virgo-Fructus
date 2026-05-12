import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { productsTable } from '@/lib/db/schema'
import { parseStockKg } from '@/lib/stock-kg'
import { inArray } from 'drizzle-orm'

type PriceEntryRaw = {
  weight?: string
  quantity?: number
  pricingMode?: 'weight' | 'quantity'
}

export type ProductStockInfo = {
  stock: number
  mode: 'weight' | 'quantity'
  /** For quantity mode: number of pieces per purchasing unit (defaults to 1). */
  perUnit: number
}

/** Lightweight stock + pricing-mode lookup for cart clamping & display (public). */
export async function GET(request: Request) {
  try {
    const ids =
      new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean) ?? []
    if (ids.length === 0) {
      return NextResponse.json({ stock: {} as Record<string, ProductStockInfo> })
    }

    const rows = await db
      .select({
        id: productsTable.id,
        stockKg: productsTable.stockKg,
        prices: productsTable.prices,
      })
      .from(productsTable)
      .where(inArray(productsTable.id, ids))

    const stock: Record<string, ProductStockInfo> = {}
    for (const row of rows) {
      const prices = (row.prices as PriceEntryRaw[] | null) ?? []
      const mode: 'weight' | 'quantity' =
        prices[0]?.pricingMode === 'quantity' ? 'quantity' : 'weight'
      const perUnit =
        mode === 'quantity'
          ? typeof prices[0]?.quantity === 'number' && prices[0]!.quantity > 0
            ? Math.floor(prices[0]!.quantity)
            : 1
          : 1
      stock[row.id] = {
        stock: parseStockKg(row.stockKg),
        mode,
        perUnit,
      }
    }

    return NextResponse.json({ stock })
  } catch (error) {
    console.error('Stock fetch error:', error)
    return NextResponse.json({ error: 'Failed to load stock' }, { status: 500 })
  }
}
