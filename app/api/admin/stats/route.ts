import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, productsTable } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(productsTable)

    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        pendingOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'PENDING')::int`,
        approvedOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'APPROVED')::int`,
        paidOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'PAID')::int`,
        shippedOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'SHIPPED')::int`,
        cancelledOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'CANCELLED')::int`,
        /**
         * Revenue counts orders the admin has accepted (APPROVED, PAID, SHIPPED).
         * PENDING is intentionally excluded so that fresh orders awaiting admin
         * approval don't inflate the dashboard figure.
         */
        totalRevenue: sql<string>`coalesce(sum(${ordersTable.totalAmount}::numeric) filter (where ${ordersTable.status} in ('APPROVED', 'PAID', 'SHIPPED')), 0)`,
      })
      .from(ordersTable)

    return NextResponse.json({
      totalRevenue: Number(orderStats?.totalRevenue ?? 0),
      totalOrders: orderStats?.totalOrders ?? 0,
      pendingOrders: orderStats?.pendingOrders ?? 0,
      approvedOrders: orderStats?.approvedOrders ?? 0,
      // `processingOrders` is the dashboard's label for "in flight" — same as approved.
      processingOrders: orderStats?.approvedOrders ?? 0,
      paidOrders: orderStats?.paidOrders ?? 0,
      shippedOrders: orderStats?.shippedOrders ?? 0,
      // `completedOrders` is what the dashboard reads for the "Isporučeno" card.
      completedOrders: orderStats?.shippedOrders ?? 0,
      cancelledOrders: orderStats?.cancelledOrders ?? 0,
      totalProducts: productCount?.count ?? 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
