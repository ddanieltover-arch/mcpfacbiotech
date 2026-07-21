-- Flat-rate checkout shipping methods (Standard / Priority Express)
DO $$ BEGIN
  CREATE TYPE "OrderShippingMethod" AS ENUM ('STANDARD', 'PRIORITY_EXPRESS');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_method" TEXT;

UPDATE "orders"
SET "shipping_method" = 'STANDARD'
WHERE "shipping_method" IS NULL
   OR "shipping_method" NOT IN ('STANDARD', 'PRIORITY_EXPRESS');

ALTER TABLE "orders" ALTER COLUMN "shipping_method" DROP DEFAULT;

ALTER TABLE "orders"
  ALTER COLUMN "shipping_method" TYPE "OrderShippingMethod"
  USING ("shipping_method"::"OrderShippingMethod");

ALTER TABLE "orders"
  ALTER COLUMN "shipping_method" SET DEFAULT 'STANDARD'::"OrderShippingMethod",
  ALTER COLUMN "shipping_method" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "orders_shipping_method_idx" ON "orders"("shipping_method");
