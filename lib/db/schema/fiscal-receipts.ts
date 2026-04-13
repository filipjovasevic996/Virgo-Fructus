import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const fiscalReceiptsTable = pgTable("fiscal_receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => ordersTable.id),
  jir: text("jir"),
  fik: text("fik"),
  qrCode: text("qr_code"),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFiscalReceiptSchema = createInsertSchema(fiscalReceiptsTable).omit({ id: true, createdAt: true });
export type InsertFiscalReceipt = z.infer<typeof insertFiscalReceiptSchema>;
export type FiscalReceipt = typeof fiscalReceiptsTable.$inferSelect;
