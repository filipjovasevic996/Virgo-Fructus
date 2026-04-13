import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema/orders'
import { orderItemsTable } from '@/lib/db/schema/order-items'
import { resend, FROM_EMAIL, SUPPLIER_EMAIL } from '@/lib/resend'
import { customerOrderEmail, supplierOrderEmail } from '@/lib/emails/order-confirmation'

function generateOrderNumber(): string {
  const now = new Date()
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VF-${datePart}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { customer, items, paymentMethod, deliveryFee } = body

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.city || !customer?.address) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )
    const total = subtotal + (deliveryFee ?? 0)
    const orderNumber = generateOrderNumber()

    const [order] = await db
      .insert(ordersTable)
      .values({
        customerName: customer.name,
        customerEmail: customer.email,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        postalCode: customer.postalCode || '',
        notes: customer.note || null,
        totalAmount: total.toString(),
        status: 'PENDING',
      })
      .returning()

    if (order) {
      const orderItems = items.map((item: { id: string; name: string; weight: string; quantity: number; price: number }) => ({
        orderId: order.id,
        productId: item.id,
        productName: `${item.name} (${item.weight})`,
        quantity: item.quantity,
        price: item.price.toString(),
      }))

      await db.insert(orderItemsTable).values(orderItems)
    }

    const emailData = {
      orderNumber,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      city: customer.city,
      address: customer.address,
      note: customer.note,
      items,
      subtotal,
      deliveryFee: deliveryFee ?? 0,
      total,
      paymentMethod: paymentMethod || 'cash',
    }

    const emailPromises: Promise<unknown>[] = []

    emailPromises.push(
      resend.emails.send({
        from: FROM_EMAIL,
        to: customer.email,
        subject: `Potvrda porudžbine #${orderNumber} — Vigor Fructus`,
        html: customerOrderEmail(emailData),
      })
    )

    if (SUPPLIER_EMAIL) {
      emailPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: SUPPLIER_EMAIL,
          subject: `Nova porudžbina #${orderNumber} — ${customer.name}`,
          html: supplierOrderEmail(emailData),
        })
      )
    }

    const emailResults = await Promise.allSettled(emailPromises)
    const emailErrors = emailResults
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason?.message || 'Unknown email error')

    if (emailErrors.length > 0) {
      console.error('Email sending errors:', emailErrors)
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: order?.id,
      emailsSent: emailResults.filter((r) => r.status === 'fulfilled').length,
      emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
    }, { status: 201 })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
