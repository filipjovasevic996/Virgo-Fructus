import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable, orderItemsTable, paymentsTable } from '@/lib/db/schema'
import { and, eq, desc, inArray } from 'drizzle-orm'

/**
 * Admin status → payment-method semantics:
 *   - PAID    → paid via website (card). Normally WSPay inserts the row
 *               from its webhook; we fall back to creating one only if no
 *               webhook ever arrived (typical for manual test orders).
 *   - SHIPPED → paid cash on delivery (courier handed over cash). No
 *               webhook for this — admin is the source of truth.
 *
 * Provider tag is the key to the precedence model:
 *   - `provider = 'admin-manual'` → row was created/edited by this route.
 *     Safe to mutate or delete on subsequent status changes so the admin
 *     can correct mistakes (PAID ↔ SHIPPED) and Finances stays in sync.
 *   - anything else (e.g. 'WSPay') → real external payment. NEVER touch.
 *     If admin needs to override real data, that's a refund flow, not a
 *     status edit.
 */

const STATUS_TO_METHOD: Record<string, string> = {
  PAID: 'card',
  SHIPPED: 'cash_on_delivery',
}

const ADMIN_MANUAL_PROVIDER = 'admin-manual'

async function syncPaymentForOrder(
  orderId: string,
  status: string,
  totalAmount: string,
) {
  const method = STATUS_TO_METHOD[status]

  // Most recent row for this order — that's the one Finances surfaces and
  // the one the orders-tab joins against.
  const [latest] = await db
    .select({
      id: paymentsTable.id,
      provider: paymentsTable.provider,
      paymentMethod: paymentsTable.paymentMethod,
    })
    .from(paymentsTable)
    .where(eq(paymentsTable.orderId, orderId))
    .orderBy(desc(paymentsTable.createdAt))
    .limit(1)

  // Status implies the order is NOT paid (PENDING / FAILED / CANCELLED).
  // Remove the admin-manual payment row so Finances stops counting it.
  // Leave any real-provider row alone — that's audited external data.
  if (!method) {
    if (latest && latest.provider === ADMIN_MANUAL_PROVIDER) {
      await db
        .delete(paymentsTable)
        .where(
          and(
            eq(paymentsTable.orderId, orderId),
            eq(paymentsTable.provider, ADMIN_MANUAL_PROVIDER),
          ),
        )
    }
    return
  }

  // Status implies the order IS paid.
  if (!latest) {
    await db.insert(paymentsTable).values({
      orderId,
      provider: ADMIN_MANUAL_PROVIDER,
      status: 'completed',
      amount: totalAmount,
      paymentMethod: method,
      type: 'payment',
    })
    return
  }

  // Existing row is a real payment (WSPay etc.) — preserve it untouched.
  if (latest.provider !== ADMIN_MANUAL_PROVIDER) return

  // Admin-manual row already matches the new method — nothing to do.
  if (latest.paymentMethod === method) return

  // Admin is toggling between Plaćeno-sajt and Plaćeno-pouzećem; reclassify
  // the row in place rather than stacking another one.
  await db
    .update(paymentsTable)
    .set({ paymentMethod: method, amount: totalAmount })
    .where(eq(paymentsTable.id, latest.id))
}

export async function GET() {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt))

    const orderIds = orders.map((order) => order.id)

    const [allItems, allPayments] =
      orderIds.length > 0
        ? await Promise.all([
            db
              .select()
              .from(orderItemsTable)
              .where(inArray(orderItemsTable.orderId, orderIds)),
            db
              .select({
                orderId: paymentsTable.orderId,
                paymentMethod: paymentsTable.paymentMethod,
                createdAt: paymentsTable.createdAt,
              })
              .from(paymentsTable)
              .where(inArray(paymentsTable.orderId, orderIds))
              .orderBy(desc(paymentsTable.createdAt)),
          ])
        : [[], []]

    const itemsByOrderId = new Map<string, typeof allItems>()
    for (const item of allItems) {
      const current = itemsByOrderId.get(item.orderId)
      if (current) current.push(item)
      else itemsByOrderId.set(item.orderId, [item])
    }

    // First payment per orderId in the desc(createdAt) result = most recent.
    const methodByOrderId = new Map<string, string>()
    for (const p of allPayments) {
      if (!methodByOrderId.has(p.orderId)) {
        methodByOrderId.set(p.orderId, p.paymentMethod)
      }
    }

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrderId.get(order.id) ?? [],
      paymentMethod: methodByOrderId.get(order.id) ?? null,
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

    await syncPaymentForOrder(order.id, order.status, String(order.totalAmount))

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
