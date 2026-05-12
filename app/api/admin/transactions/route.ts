import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentsTable, ordersTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

function normalizeMethod(value: string | null | undefined): 'card' | 'cash' | 'bank_transfer' {
  if (value === 'card' || value === 'bank_transfer') return value
  return 'cash'
}

function normalizeType(value: string | null | undefined): 'payment' | 'refund' {
  return value === 'refund' ? 'refund' : 'payment'
}

function normalizeStatus(
  value: string | null | undefined,
): 'completed' | 'pending' | 'failed' {
  if (value === 'pending' || value === 'failed') return value
  return 'completed'
}

function shortOrderRef(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: paymentsTable.id,
        orderId: paymentsTable.orderId,
        amount: paymentsTable.amount,
        paymentMethod: paymentsTable.paymentMethod,
        type: paymentsTable.type,
        status: paymentsTable.status,
        createdAt: paymentsTable.createdAt,
        customerName: ordersTable.customerName,
      })
      .from(paymentsTable)
      .innerJoin(ordersTable, eq(paymentsTable.orderId, ordersTable.id))
      .orderBy(desc(paymentsTable.createdAt))

    const transactions = rows.map((row) => ({
      id: row.id,
      orderId: row.orderId,
      orderNumber: shortOrderRef(row.orderId),
      type: normalizeType(row.type),
      amount: Number(row.amount ?? 0),
      status: normalizeStatus(row.status),
      paymentMethod: normalizeMethod(row.paymentMethod),
      customerName: row.customerName,
      createdAt: row.createdAt,
    }))

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
