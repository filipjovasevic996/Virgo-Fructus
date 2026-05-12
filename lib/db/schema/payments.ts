import { pgTable, text, timestamp, uuid, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  provider: text("provider").notNull().default("manual"),
  transactionId: text("transaction_id"),
  /** Amount actually moved in this transaction (positive for both payments and refunds). */
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  /** "cash" | "card" | "bank_transfer" — mirrors the order's payment method. */
  paymentMethod: text("payment_method").notNull().default("cash"),
  /** "payment" | "refund" */
  type: text("type").notNull().default("payment"),
  /** "completed" | "pending" | "failed" */
  status: text("status").notNull(),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
