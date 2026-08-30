-- Manual migration (this project applies schema changes with `pnpm db:push`;
-- run this file directly if you prefer explicit SQL).
--
-- 1. products.is_regular  — false = image fills the card instead of breaking out of it
-- 2. products.sort_order  — manual storefront ordering maintained from the admin panel
-- 3. order_items.product_id — nullable + ON DELETE SET NULL so deleting a product
--    that has already been ordered no longer fails with a foreign-key violation
--    (this was the cause of `DELETE /api/admin/products` → 500).

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "is_regular" boolean NOT NULL DEFAULT true;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;

-- Seed sort_order with the ordering the storefront used until now (newest first),
-- so nothing visibly changes until an admin drags a row.
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" DESC) AS rn
  FROM "products"
)
UPDATE "products" p
SET "sort_order" = ranked.rn
FROM ranked
WHERE p."id" = ranked."id" AND p."sort_order" = 0;

ALTER TABLE "order_items"
  ALTER COLUMN "product_id" DROP NOT NULL;

DO $$
DECLARE
  fk_name text;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = '"order_items"'::regclass
    AND contype = 'f'
    AND conkey = ARRAY[(
      SELECT attnum FROM pg_attribute
      WHERE attrelid = '"order_items"'::regclass AND attname = 'product_id'
    )]::smallint[];

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "order_items" DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE "order_items"
  ADD CONSTRAINT "order_items_product_id_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL;
