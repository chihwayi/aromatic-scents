-- ============================================================
-- Aromatic Scents — Migration: Old DB → BobPay Schema
-- Run this AFTER restoring the old backup to the new Supabase
-- instance. It drops the old Stripe-based orders/order_items
-- tables and replaces them with the BobPay-based schema.
-- ============================================================

-- ─── 1. Drop old Stripe-era tables ───────────────────────────────────────────
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders       CASCADE;
DROP VIEW  IF EXISTS public.order_stats  CASCADE;

-- ─── 2. Add fragrance_notes to products (new luxury card overlay) ─────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS fragrance_notes JSONB DEFAULT '{"top":[],"heart":[],"base":[]}';

-- ─── 3. New BobPay orders table ───────────────────────────────────────────────
CREATE TABLE public.orders (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_payment_id   VARCHAR(64) UNIQUE NOT NULL,   -- AS-YYYYMMDD-XXXXXXXX
  bobpay_uuid         VARCHAR(128),
  bobpay_short_ref    VARCHAR(32),
  bobpay_payment_id   BIGINT,

  -- Customer
  customer_email      VARCHAR(255) NOT NULL,
  customer_phone      VARCHAR(32),
  customer_type       VARCHAR(16)  NOT NULL DEFAULT 'regular',

  -- Cart snapshot (JSONB — no separate order_items table needed)
  items               JSONB        NOT NULL DEFAULT '[]',

  -- Financials
  subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_cost       NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount         NUMERIC(10,2),
  currency            VARCHAR(8)    NOT NULL DEFAULT 'ZAR',

  -- Payment
  status              VARCHAR(24)   NOT NULL DEFAULT 'pending',
  payment_method      VARCHAR(64),
  from_bank           VARCHAR(64),
  is_test             BOOLEAN       NOT NULL DEFAULT true,

  -- Delivery
  include_delivery    BOOLEAN       NOT NULL DEFAULT false,

  -- Audit
  webhook_payload     JSONB,
  webhook_received_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─── 4. Webhook logs table (idempotency + audit) ──────────────────────────────
CREATE TABLE public.webhook_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source          VARCHAR(32) NOT NULL DEFAULT 'bobpay',
  event_id        VARCHAR(128),
  order_id        UUID        REFERENCES public.orders(id) ON DELETE SET NULL,
  status          VARCHAR(24),
  payload         JSONB       NOT NULL,
  ip_address      VARCHAR(64),
  signature_valid BOOLEAN,
  processed       BOOLEAN     NOT NULL DEFAULT false,
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. Indexes ───────────────────────────────────────────────────────────────
CREATE INDEX idx_orders_status            ON public.orders(status);
CREATE INDEX idx_orders_custom_payment_id ON public.orders(custom_payment_id);
CREATE INDEX idx_orders_bobpay_uuid       ON public.orders(bobpay_uuid);
CREATE INDEX idx_orders_created_at        ON public.orders(created_at DESC);
CREATE INDEX idx_orders_customer_email    ON public.orders(customer_email);
CREATE INDEX idx_webhook_logs_event_id    ON public.webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_created_at  ON public.webhook_logs(created_at DESC);

-- ─── 6. Auto-update updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 7. Revenue / admin stats view ───────────────────────────────────────────
CREATE OR REPLACE VIEW public.order_stats AS
SELECT
  COUNT(*)                                                                          AS total_orders,
  COUNT(*) FILTER (WHERE status = 'paid')                                           AS paid_orders,
  COUNT(*) FILTER (WHERE status = 'pending')                                        AS pending_orders,
  COUNT(*) FILTER (WHERE status = 'failed')                                         AS failed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled')                                      AS cancelled_orders,
  COUNT(*) FILTER (WHERE status = 'refunded')                                       AS refunded_orders,
  COALESCE(SUM(paid_amount)    FILTER (WHERE status = 'paid'), 0)                   AS total_revenue,
  COALESCE(AVG(paid_amount)    FILTER (WHERE status = 'paid'), 0)                   AS avg_order_value,
  COALESCE(SUM(delivery_cost)  FILTER (WHERE status = 'paid' AND include_delivery), 0) AS total_delivery_collected,
  COALESCE(SUM(paid_amount)    FILTER (
    WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'
  ), 0)                                                                             AS revenue_last_30_days
FROM public.orders;

-- ─── 8. Grants ────────────────────────────────────────────────────────────────
GRANT ALL ON TABLE public.orders        TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.webhook_logs  TO anon, authenticated, service_role;
GRANT SELECT ON public.order_stats      TO anon, authenticated, service_role;

-- ─── 9. Ensure settings seed rows exist ──────────────────────────────────────
INSERT INTO public.settings (key, value, description) VALUES
  ('delivery_cost',         '50.00', 'Standard delivery cost in ZAR'),
  ('bulk_discount_enabled', 'true',  'Enable bulk pricing for resellers')
ON CONFLICT (key) DO NOTHING;
