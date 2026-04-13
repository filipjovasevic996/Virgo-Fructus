import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentsTable, ordersTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const payments = await db
      .select({
        id: paymentsTable.id,
        orderId: paymentsTable.orderId,
        provider: paymentsTable.provider,
        transactionId: paymentsTable.transactionId,
        status: paymentsTable.status,
        createdAt: paymentsTable.createdAt,
        customerName: ordersTable.customerName,
        customerEmail: ordersTable.customerEmail,
        orderAmount: ordersTable.totalAmount,
      })
      .from(paymentsTable)
      .innerJoin(ordersTable, eq(paymentsTable.orderId, ordersTable.id))
      .orderBy(desc(paymentsTable.createdAt))

    return NextResponse.json({ transactions: payments })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
