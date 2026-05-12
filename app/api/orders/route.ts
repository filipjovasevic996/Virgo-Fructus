import { type NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema/orders'
import { orderItemsTable } from '@/lib/db/schema/order-items'
import { productsTable } from '@/lib/db/schema/products'
import { parseWeightToGrams } from '@/lib/parse-weight-grams'
import { priceEntryLabel, type PriceEntryLike } from '@/lib/price-entry-label'
import { kgToDecigrams, parseStockKg } from '@/lib/stock-kg'
import { resend, FROM_EMAIL, SUPPLIER_EMAIL } from '@/lib/resend'
import { customerOrderEmail, supplierOrderEmail } from '@/lib/emails/order-confirmation'

function generateOrderNumber(): string {
  const now = new Date()
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `VF-${datePart}-${random}`
}

type OrderItemInput = {
  id: string
  name: string
  weight: string
  optionName?: string
  optionValue?: string
  quantity: number
  price: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { customer, items, paymentMethod, deliveryFee } = body as {
      customer: Record<string, unknown>
      items: OrderItemInput[]
      paymentMethod?: string
      deliveryFee?: number
    }

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.city || !customer?.address) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const subtotal = items.reduce(
      (sum: number, item: OrderItemInput) => sum + item.price * item.quantity,
      0,
    )
    const total = subtotal + (deliveryFee ?? 0)
    const orderNumber = generateOrderNumber()

    const emailData = {
      orderNumber,
      customerName: String(customer.name),
      customerEmail: String(customer.email),
      customerPhone: String(customer.phone),
      city: String(customer.city),
      address: String(customer.address),
      note: customer.note ? String(customer.note) : undefined,
      items,
      subtotal,
      deliveryFee: deliveryFee ?? 0,
      total,
      paymentMethod: paymentMethod || 'cash',
    }

    let orderId: string | undefined

    try {
      await db.transaction(async (tx) => {
        const productIds = [...new Set(items.map((i) => i.id))]

        const productRows = await tx
          .select({
            id: productsTable.id,
            stockKg: productsTable.stockKg,
            prices: productsTable.prices,
          })
          .from(productsTable)
          .where(inArray(productsTable.id, productIds))
          .for('update')

        if (productRows.length !== productIds.length) {
          throw new Error('PRODUCT_NOT_FOUND')
        }

        type ProductMeta = {
          pricingMode: 'weight' | 'quantity'
          prices: PriceEntryLike[]
          stockKg: number
        }
        const metaById = new Map<string, ProductMeta>(
          productRows.map((r) => {
            const prices = (r.prices as PriceEntryLike[]) ?? []
            const pricingMode: 'weight' | 'quantity' =
              prices[0]?.pricingMode === 'quantity' ? 'quantity' : 'weight'
            return [
              r.id,
              {
                pricingMode,
                prices,
                stockKg: parseStockKg(r.stockKg),
              },
            ]
          }),
        )

        const gramsNeeded = new Map<string, number>()
        const piecesNeeded = new Map<string, number>()

        for (const item of items) {
          const meta = metaById.get(item.id)
          if (!meta) throw new Error('PRODUCT_NOT_FOUND')

          if (meta.pricingMode === 'quantity') {
            const matched = meta.prices.find(
              (entry) => priceEntryLabel(entry) === item.weight,
            )
            const perPackPieces =
              typeof matched?.quantity === 'number' && matched.quantity > 0
                ? Math.floor(matched.quantity)
                : 1
            piecesNeeded.set(
              item.id,
              (piecesNeeded.get(item.id) ?? 0) + perPackPieces * item.quantity,
            )
            continue
          }

          const perPack = parseWeightToGrams(item.weight)
          if (!perPack) {
            throw new Error('INVALID_WEIGHT')
          }
          gramsNeeded.set(
            item.id,
            (gramsNeeded.get(item.id) ?? 0) + perPack * item.quantity,
          )
        }

        for (const [id, grams] of gramsNeeded) {
          const meta = metaById.get(id)
          if (!meta) throw new Error('PRODUCT_NOT_FOUND')
          const availDg = kgToDecigrams(meta.stockKg)
          const neededDg = grams * 10
          if (neededDg > availDg) {
            throw new Error('INSUFFICIENT_STOCK')
          }
        }

        for (const [id, pieces] of piecesNeeded) {
          const meta = metaById.get(id)
          if (!meta) throw new Error('PRODUCT_NOT_FOUND')
          const availPieces = Math.max(0, Math.floor(meta.stockKg))
          if (pieces > availPieces) {
            throw new Error('INSUFFICIENT_STOCK')
          }
        }

        const normalizedPaymentMethod =
          paymentMethod === 'card' || paymentMethod === 'bank_transfer'
            ? paymentMethod
            : 'cash'

        const [order] = await tx
          .insert(ordersTable)
          .values({
            customerName: String(customer.name),
            customerEmail: String(customer.email),
            phone: String(customer.phone),
            city: String(customer.city),
            address: String(customer.address),
            postalCode: customer.postalCode ? String(customer.postalCode) : '',
            notes: customer.note ? String(customer.note) : null,
            totalAmount: total.toString(),
            status: 'PENDING',
            paymentMethod: normalizedPaymentMethod,
          })
          .returning()

        if (!order) {
          throw new Error('ORDER_INSERT_FAILED')
        }

        orderId = order.id

        const orderItems = items.map((item) => ({
          orderId: order.id,
          productId: item.id,
          productName: item.optionValue
            ? `${item.name} (${item.weight} · ${item.optionValue})`
            : `${item.name} (${item.weight})`,
          quantity: item.quantity,
          price: item.price.toString(),
        }))

        await tx.insert(orderItemsTable).values(orderItems)

        for (const [id, grams] of gramsNeeded) {
          await tx
            .update(productsTable)
            .set({
              stockKg: sql`${productsTable.stockKg} - (${grams}::numeric / 1000.0)`,
              updatedAt: new Date(),
            })
            .where(eq(productsTable.id, id))
        }

        for (const [id, pieces] of piecesNeeded) {
          await tx
            .update(productsTable)
            .set({
              stockKg: sql`${productsTable.stockKg} - ${pieces}::numeric`,
              updatedAt: new Date(),
            })
            .where(eq(productsTable.id, id))
        }
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      if (msg === 'INSUFFICIENT_STOCK') {
        return NextResponse.json(
          {
            error:
              'Nema dovoljno zaliha za jedan ili više proizvoda. Osvežite korpu i pokušajte ponovo.',
          },
          { status: 409 },
        )
      }
      if (msg === 'PRODUCT_NOT_FOUND') {
        return NextResponse.json({ error: 'Nepoznat proizvod u porudžbini.' }, { status: 400 })
      }
      if (msg === 'INVALID_WEIGHT') {
        return NextResponse.json({ error: 'Neispravna gramaža u porudžbini.' }, { status: 400 })
      }
      console.error('Order transaction error:', e)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    revalidatePath('/prodavnica')
    revalidatePath('/')
    revalidatePath('/en/prodavnica')
    revalidatePath('/en')

    const emailPromises: Promise<unknown>[] = []

    emailPromises.push(
      resend.emails.send({
        from: FROM_EMAIL,
        to: String(customer.email),
        subject: `Potvrda porudžbine #${orderNumber} — Vigor Fructus`,
        html: customerOrderEmail(emailData),
      }),
    )

    if (SUPPLIER_EMAIL) {
      emailPromises.push(
        resend.emails.send({
          from: FROM_EMAIL,
          to: SUPPLIER_EMAIL,
          subject: `Nova porudžbina #${orderNumber} — ${String(customer.name)}`,
          html: supplierOrderEmail(emailData),
        }),
      )
    }

    const emailResults = await Promise.allSettled(emailPromises)
    const emailErrors = emailResults
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason?.message || 'Unknown email error')

    if (emailErrors.length > 0) {
      console.error('Email sending errors:', emailErrors)
    }

    return NextResponse.json(
      {
        success: true,
        orderNumber,
        orderId,
        emailsSent: emailResults.filter((r) => r.status === 'fulfilled').length,
        emailErrors: emailErrors.length > 0 ? emailErrors : undefined,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
