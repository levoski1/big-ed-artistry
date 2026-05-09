-- ============================================================
-- Add idempotency_key to orders table for duplicate prevention
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key UUID;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key ON orders(idempotency_key);
