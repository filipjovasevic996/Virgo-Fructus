import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable, paymentsTable } from '@/lib/db/schema'
import { and, eq, desc, inArray } from 'drizzle-orm'
import { resend, FROM_EMAIL } from '@/lib/resend'
import {
  orderApprovedEmail,
  orderCancelledEmail,
} from '@/lib/emails/order-confirmation'

const VALID_STATUSES = [
  'PENDING',
  'APPROVED',
  'PAID',
  'SHIPPED',
  'FAILED',
  'CANCELLED',
] as const
type OrderStatus = (typeof VALID_STATUSES)[number]

function shortOrderRef(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

/**
 * Records a `payments` row when an order transitions into `PAID`, so the
 * Finansije tab has a transaction to display. Idempotent: re-marking the
 * same order PAID won't create duplicate completed-payment rows.
 */
async function recordPaymentIfNeeded(
  prevStatus: OrderStatus | null,
  nextStatus: OrderStatus,
  orderId: string,
): Promise<void> {
  if (prevStatus === nextStatus) return
  if (nextStatus !== 'PAID') return

  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1)
    if (!order) return

    const existing = await db
      .select({ id: paymentsTable.id })
      .from(paymentsTable)
      .where(
        and(
          eq(paymentsTable.orderId, orderId),
          eq(paymentsTable.type, 'payment'),
          eq(paymentsTable.status, 'completed'),
        ),
      )
      .limit(1)
    if (existing.length > 0) return

    await db.insert(paymentsTable).values({
      orderId: order.id,
      provider: 'manual',
      type: 'payment',
      status: 'completed',
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod ?? 'cash',
    })
  } catch (err) {
    console.error('Failed to record payment row for order:', err)
  }
}

async function sendStatusEmail(
  prevStatus: OrderStatus | null,
  nextStatus: OrderStatus,
  orderId: string,
): Promise<void> {
  if (prevStatus === nextStatus) return
  if (nextStatus !== 'APPROVED' && nextStatus !== 'CANCELLED') return

  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1)
    if (!order) return

    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, orderId))

    const orderNumber = shortOrderRef(order.id)
    const total = Number(order.totalAmount)

    if (nextStatus === 'APPROVED') {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.customerEmail,
        subject: `Porudžbina #${orderNumber} je odobrena — Vigor Fructus`,
        html: orderApprovedEmail({
          orderNumber,
          customerName: order.customerName,
          total,
          items: items.map((it) => ({
            name: it.productName,
            weight: '',
            quantity: it.quantity,
            price: Number(it.price),
          })),
        }),
      })
    } else if (nextStatus === 'CANCELLED') {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: order.customerEmail,
        subject: `Porudžbina #${orderNumber} je otkazana — Vigor Fructus`,
        html: orderCancelledEmail({
          orderNumber,
          customerName: order.customerName,
        }),
      })
    }
  } catch (err) {
    console.error('Failed to send status-change email:', err)
  }
}

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

    if (!VALID_STATUSES.includes(body.status as OrderStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const nextStatus = body.status as OrderStatus

    const [prev] = await db
      .select({ status: ordersTable.status })
      .from(ordersTable)
      .where(eq(ordersTable.id, body.id))
      .limit(1)

    const [order] = await db
      .update(ordersTable)
      .set({ status: nextStatus })
      .where(eq(ordersTable.id, body.id))
      .returning()

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const prevStatusValue = (prev?.status as OrderStatus | undefined) ?? null

    // Fire-and-forget: don't block the admin UI while Resend processes.
    void sendStatusEmail(prevStatusValue, nextStatus, order.id)
    void recordPaymentIfNeeded(prevStatusValue, nextStatus, order.id)

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
