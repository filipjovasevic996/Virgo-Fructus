import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id))
        return { ...order, items }
      })
    )

    return NextResponse.json({ orders: ordersWithItems })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: 'Order ID and status required' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING', 'PAID', 'FAILED', 'SHIPPED', 'CANCELLED']
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const [order] = await db
      .update(ordersTable)
      .set({ status: body.status })
      .where(eq(ordersTable.id, body.id))
      .returning()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
