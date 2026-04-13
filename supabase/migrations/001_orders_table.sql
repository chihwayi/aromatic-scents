-- ============================================================
-- Aromatic Scents — Orders & Financial Tracking
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_payment_id     VARCHAR(64) UNIQUE NOT NULL,   -- our internal AS-YYYYMMDD-XXXX ref
  bobpay_uuid           VARCHAR(128),                   -- BobPay's payment UUID (from webhook)
  bobpay_short_ref      VARCHAR(32),                    -- e.g. BP1234
  bobpay_payment_id     BIGINT,

  -- Customer
  customer_email        VARCHAR(255) NOT NULL,
  customer_phone        VARCHAR(32),
  customer_type         VARCHAR(16) NOT NULL DEFAULT 'regular', -- 'regular' | 'reseller'

  -- Items (snapshot of cart at time of order)
  items                 JSONB NOT NULL DEFAULT '[]',

  -- Financials
  subtotal              NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_cost         NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount           NUMERIC(10,2),
  currency              VARCHAR(8) NOT NULL DEFAULT 'ZAR',

  -- Payment info
  status                VARCHAR(24) NOT NULL DEFAULT 'pending',
  -- Possible: pending | paid | failed | cancelled | processing | refunded
  payment_method        VARCHAR(64),
  from_bank             VARCHAR(64),
  is_test               BOOLEAN NOT NULL DEFAULT true,

  -- Delivery
  include_delivery      BOOLEAN NOT NULL DEFAULT false,

  -- Audit
  webhook_payload       JSONB,          -- full BobPay webhook payload stored for audit
  webhook_received_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook logs table (idempotency + audit trail)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source          VARCHAR(32) NOT NULL DEFAULT 'bobpay',
  event_id        VARCHAR(128),          -- BobPay uuid
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  status          VARCHAR(24),
  payload         JSONB NOT NULL,
  ip_address      VARCHAR(64),
  signature_valid BOOLEAN,
  processed       BOOLEAN NOT NULL DEFAULT false,
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings table (extend if not already present)
INSERT INTO settings (key, value) VALUES
  ('delivery_cost', '50.00'),
  ('bulk_discount_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_custom_payment_id ON orders(custom_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_bobpay_uuid       ON orders(bobpay_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_created_at        ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email    ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id    ON webhook_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at  ON webhook_logs(created_at DESC);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Revenue View (for admin dashboard) ──────────────────────────────────────
CREATE OR REPLACE VIEW order_stats AS
SELECT
  COUNT(*)                                          AS total_orders,
  COUNT(*) FILTER (WHERE status = 'paid')           AS paid_orders,
  COUNT(*) FILTER (WHERE status = 'pending')        AS pending_orders,
  COUNT(*) FILTER (WHERE status = 'failed')         AS failed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled')      AS cancelled_orders,
  COUNT(*) FILTER (WHERE status = 'refunded')       AS refunded_orders,
  COALESCE(SUM(paid_amount) FILTER (WHERE status = 'paid'), 0)  AS total_revenue,
  COALESCE(AVG(paid_amount) FILTER (WHERE status = 'paid'), 0)  AS avg_order_value,
  COALESCE(SUM(delivery_cost) FILTER (WHERE status = 'paid'), 0) AS total_delivery_collected,
  COUNT(*) FILTER (WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days') AS paid_last_30_days,
  COALESCE(SUM(paid_amount) FILTER (WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'), 0) AS revenue_last_30_days
FROM orders;

-- ─── Row Level Security (optional — enable if needed) ─────────────────────────
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
