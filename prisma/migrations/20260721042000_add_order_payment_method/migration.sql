-- Manual payment method selection (no gateway capture)
-- Idempotent for environments where a prior attempt partially applied.

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM (
    'BITCOIN',
    'USDT',
    'CREDIT_CARD',
    'BANK_TRANSFER',
    'CHIME',
    'CASH_APP'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_method" TEXT;

UPDATE "orders"
SET "payment_method" = 'BANK_TRANSFER'
WHERE "payment_method" IS NULL
   OR "payment_method" NOT IN ('BITCOIN', 'USDT', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHIME', 'CASH_APP');

ALTER TABLE "orders" ALTER COLUMN "payment_method" DROP DEFAULT;

ALTER TABLE "orders"
  ALTER COLUMN "payment_method" TYPE "PaymentMethod"
  USING ("payment_method"::"PaymentMethod");

ALTER TABLE "orders"
  ALTER COLUMN "payment_method" SET DEFAULT 'BANK_TRANSFER'::"PaymentMethod",
  ALTER COLUMN "payment_method" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "orders_payment_method_idx" ON "orders"("payment_method");
