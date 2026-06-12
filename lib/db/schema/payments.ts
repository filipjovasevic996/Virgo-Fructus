import { pgTable, text, timestamp, uuid, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  provider: text("provider").notNull().default("WSPay"),
  transactionId: text("transaction_id"),
  status: text("status").notNull(),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Amount, payment method and type are tracked per-payment so partial
  // payments and refunds can coexist for the same order.
  // `amount` is Postgres `numeric` → comes back as a string in JS; parse with
  // Number/parseFloat before doing arithmetic.
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentMethod: text("payment_method").notNull().default("cash"),
  // Conventional values: 'payment' | 'refund'. Free-text column for forward
  // compatibility; UI normalizes unknown values back to 'payment'.
  type: text("type").notNull().default("payment"),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
