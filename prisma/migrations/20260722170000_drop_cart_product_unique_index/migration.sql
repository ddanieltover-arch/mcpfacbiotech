-- The prior migration used DROP CONSTRAINT, but Prisma created a UNIQUE INDEX
-- (not a table constraint). That leftover index still enforces (cart_id, product_id)
-- only, so adding the same product twice (even with matching variants) fails with 23505.
DROP INDEX IF EXISTS "cart_items_cart_id_product_id_key";
