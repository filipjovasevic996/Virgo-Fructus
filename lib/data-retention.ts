import { and, isNotNull, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { ordersTable } from '@/lib/db/schema/orders'

/** GDPR storage-limitation window. Confirm this against Serbian tax/accounting
 *  record-keeping requirements before relying on it — invoices tied to sales
 *  are often required to be kept far longer than customer PII would be. */
export const CUSTOMER_DATA_RETENTION_DAYS = 90

/**
 * Nullifies customer PII (name, email, phone, address, postal code, notes)
 * on orders older than the retention window. Order totals, status, items,
 * and city are left untouched — they're not personal data on their own and
 * are needed for accounting/reporting.
 */
export async function purgeExpiredCustomerData(): Promise<{ purgedCount: number }> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - CUSTOMER_DATA_RETENTION_DAYS)

  const purged = await db
    .update(ordersTable)
    .set({
      customerName: null,
      customerEmail: null,
      phone: null,
      address: null,
      postalCode: null,
      notes: null,
    })
    .where(and(lt(ordersTable.createdAt, cutoff), isNotNull(ordersTable.customerEmail)))
    .returning({ id: ordersTable.id })

  return { purgedCount: purged.length }
}
