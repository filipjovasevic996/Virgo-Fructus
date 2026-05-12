import { pgTable, text, timestamp, uuid, jsonb, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productStatusEnum = ["active", "draft", "hidden"] as const;
export type ProductStatus = (typeof productStatusEnum)[number];

export const supportedLocales = ["sr", "en"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export type LocalizedField = Record<SupportedLocale, string>;

export const productsTable = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").notNull().default({ sr: "", en: "" }),
  category: text("category").notNull(),
  description: jsonb("description").notNull().default({ sr: "", en: "" }),
  shortDescription: jsonb("short_description").notNull().default({ sr: "", en: "" }),
  image: text("image").notNull().default(""),
  images: jsonb("images").notNull().default([]),
  badge: text("badge"),
  status: text("status").notNull().default("active"),
  prices: jsonb("prices").notNull().default([]),
  isFavorite: boolean("is_favorite").notNull().default(false),
  stockKg: numeric("stock_kg", { precision: 14, scale: 4 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const priceEntrySchema = z
  .object({
    weight: z.string().optional(),
    quantity: z.number().int().positive().optional(),
    price: z.number(),
    salePrice: z.number().optional(),
    pricingMode: z.enum(["weight", "quantity"]).optional(),
  })
  .refine(
    (entry) => {
      const mode = entry.pricingMode ?? "weight";
      return mode === "quantity"
        ? typeof entry.quantity === "number"
        : typeof entry.weight === "string" && entry.weight.length > 0;
    },
    {
      message:
        "Price entry must define `weight` for weight pricing or `quantity` for quantity pricing.",
    },
  );

export const localizedFieldSchema = z.object({
  sr: z.string(),
  en: z.string().optional().default(""),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export type ProductPriceEntry = z.infer<typeof priceEntrySchema>;

/**
 * Resolves a localized JSONB field to a plain string.
 * Falls back to Serbian if the requested locale is empty, then to the raw value if it's a plain string.
 */
export function resolveLocalized(field: unknown, locale: SupportedLocale = "sr"): string {
  if (typeof field === "string") return field;
  if (field && typeof field === "object") {
    const obj = field as Record<string, string>;
    return obj[locale] || obj.sr || "";
  }
  return "";
}
