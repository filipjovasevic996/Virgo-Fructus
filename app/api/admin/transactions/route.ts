import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentsTable, ordersTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import type { Transaction } from '@/lib/admin-store'

/**
 * Maps the DB `payments` row to the `Transaction` shape consumed by the
 * admin UI. The mapping is mostly 1:1 now that `payments` carries its own
 * `amount`, `payment_method`, and `type` columns. The remaining adapter
 * work is enum normalization (free-text columns → strict UI unions) and
 * deriving a human-readable order number (DB has no `order_number` column).
 */

function normalizeStatus(raw: string | null | undefined): Transaction['status'] {
  const s = (raw ?? '').toLowerCase()
  if (s === 'completed' || s === 'paid' || s === 'success' || s === 'succeeded') {
    return 'completed'
  }
  if (s === 'failed' || s === 'error' || s === 'declined') return 'failed'
  return 'pending'
}

function normalizeType(raw: string | null | undefined): Transaction['type'] {
  return (raw ?? '').toLowerCase() === 'refund' ? 'refund' : 'payment'
}

function normalizeMethod(
  raw: string | null | undefined,
): Transaction['paymentMethod'] {
  const m = (raw ?? '').toLowerCase()
  if (
    m === 'cash' ||
    m === 'cash_on_delivery' ||
    m === 'pouzece' ||
    m === 'pouzeće'
  ) {
    return 'cash_on_delivery'
  }
  if (m === 'bank' || m === 'bank_transfer' || m === 'uplata') {
    return 'bank_transfer'
  }
  return 'card'
}

/**
 * DB has no `order_number` column. Derive a short, stable code from the
 * order UUID so the admin UI has something searchable and human-friendly.
 * Replace with the real column once orders carry a sequential number.
 */
function deriveOrderNumber(orderId: string): string {
  return `VF-${orderId.slice(0, 8).toUpperCase()}`
}

function parseAmount(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw === 'string') {
    const n = Number.parseFloat(raw)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: paymentsTable.id,
        orderId: paymentsTable.orderId,
        status: paymentsTable.status,
        amount: paymentsTable.amount,
        paymentMethod: paymentsTable.paymentMethod,
        type: paymentsTable.type,
        createdAt: paymentsTable.createdAt,
        customerName: ordersTable.customerName,
      })
      .from(paymentsTable)
      .innerJoin(ordersTable, eq(paymentsTable.orderId, ordersTable.id))
      .orderBy(desc(paymentsTable.createdAt))

    const transactions: Transaction[] = rows.map((row) => ({
      id: row.id,
      orderId: row.orderId,
      orderNumber: deriveOrderNumber(row.orderId),
      type: normalizeType(row.type),
      amount: parseAmount(row.amount),
      status: normalizeStatus(row.status),
      paymentMethod: normalizeMethod(row.paymentMethod),
      customerName: row.customerName ?? '',
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt ?? new Date(0).toISOString()),
    }))

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}
