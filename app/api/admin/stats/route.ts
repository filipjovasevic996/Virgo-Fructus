import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, productsTable } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET() {
  try {
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)

    const [orderCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)

    const [pendingOrders] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'PENDING'))

    const [paidOrders] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'PAID'))

    const [shippedOrders] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'SHIPPED'))

    const [cancelledOrders] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'CANCELLED'))

    const [totalRevenue] = await db
      .select({ total: sql<string>`coalesce(sum(total_amount::numeric), 0)` })
      .from(ordersTable)
      .where(eq(ordersTable.status, 'PAID'))

    return NextResponse.json({
      totalRevenue: Number(totalRevenue?.total ?? 0),
      totalOrders: orderCount?.count ?? 0,
      pendingOrders: pendingOrders?.count ?? 0,
      paidOrders: paidOrders?.count ?? 0,
      shippedOrders: shippedOrders?.count ?? 0,
      cancelledOrders: cancelledOrders?.count ?? 0,
      totalProducts: productCount?.count ?? 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
