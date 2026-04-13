import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const invoicesSefTable = pgTable("invoices_sef", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  sefInvoiceId: text("sef_invoice_id"),
  xmlPayload: text("xml_payload"),
  status: text("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInvoiceSefSchema = createInsertSchema(invoicesSefTable).omit({ id: true, createdAt: true });
export type InsertInvoiceSef = z.infer<typeof insertInvoiceSefSchema>;
export type InvoiceSef = typeof invoicesSefTable.$inferSelect;
