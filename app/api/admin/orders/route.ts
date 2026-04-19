import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable } from '@/lib/db/schema'
import { eq, desc, inArray } from 'drizzle-orm'

export async function GET() {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))

    const orderIds = orders.map((order) => order.id)
    const allItems =
      orderIds.length > 0
        ? await db
            .select()
            .from(orderItemsTable)
            .where(inArray(orderItemsTable.orderId, orderIds))
        : []

    const itemsByOrderId = new Map<string, typeof allItems>()
    for (const item of allItems) {
      const current = itemsByOrderId.get(item.orderId)
      if (current) current.push(item)
      else itemsByOrderId.set(item.orderId, [item])
    }

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrderId.get(order.id) ?? [],
    }))

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
