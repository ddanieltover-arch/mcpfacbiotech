-- Allow cart lines to reference a selected product variant (price modifier).
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "variant_id" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_variant_id_fkey'
  ) THEN
    ALTER TABLE "cart_items"
      ADD CONSTRAINT "cart_items_variant_id_fkey"
      FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "cart_items" DROP CONSTRAINT IF EXISTS "cart_items_cart_id_product_id_key";

CREATE INDEX IF NOT EXISTS "cart_items_variant_id_idx" ON "cart_items"("variant_id");
CREATE INDEX IF NOT EXISTS "cart_items_cart_id_product_id_variant_id_idx"
  ON "cart_items"("cart_id", "product_id", "variant_id");

-- Treat NULL variant as a sentinel so one line per product+variant combo.
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cart_product_variant_uidx"
  ON "cart_items" (
    "cart_id",
    "product_id",
    (COALESCE("variant_id", '00000000-0000-0000-0000-000000000000'::uuid))
  );
