-- ============================================================
-- Aromatic Scents — Complete Database Setup
-- Run this on a BLANK Supabase / PostgreSQL instance to get
-- everything up and running from scratch (schema + seed data).
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Drop existing (safe re-run) ─────────────────────────────────────────────
DROP VIEW  IF EXISTS public.order_stats  CASCADE;
DROP TABLE IF EXISTS public.webhook_logs CASCADE;
DROP TABLE IF EXISTS public.orders       CASCADE;
DROP TABLE IF EXISTS public.order_items  CASCADE;  -- old Stripe table, not used
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products     CASCADE;
DROP TABLE IF EXISTS public.settings     CASCADE;

-- ─── 1. PRODUCTS ──────────────────────────────────────────────────────────────
CREATE TABLE public.products (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  image_url        TEXT,
  is_new_arrival   BOOLEAN      NOT NULL DEFAULT false,
  fragrance_notes  JSONB        NOT NULL DEFAULT '{"top":[],"heart":[],"base":[]}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── 2. PRODUCT VARIANTS ──────────────────────────────────────────────────────
CREATE TABLE public.product_variants (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_ml           INTEGER     NOT NULL CHECK (size_ml = ANY (ARRAY[35, 50, 100])),
  regular_price     NUMERIC(10,2) NOT NULL,
  bulk_price        NUMERIC(10,2),
  bulk_min_quantity INTEGER     NOT NULL DEFAULT 1,
  stock_quantity    INTEGER     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. SETTINGS ──────────────────────────────────────────────────────────────
CREATE TABLE public.settings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(255) UNIQUE NOT NULL,
  value       TEXT        NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. ORDERS (BobPay) ───────────────────────────────────────────────────────
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

  -- Cart snapshot
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

-- ─── 5. WEBHOOK LOGS ──────────────────────────────────────────────────────────
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

-- ─── 6. INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

CREATE INDEX idx_orders_status            ON public.orders(status);
CREATE INDEX idx_orders_custom_payment_id ON public.orders(custom_payment_id);
CREATE INDEX idx_orders_bobpay_uuid       ON public.orders(bobpay_uuid);
CREATE INDEX idx_orders_created_at        ON public.orders(created_at DESC);
CREATE INDEX idx_orders_customer_email    ON public.orders(customer_email);

CREATE INDEX idx_webhook_logs_event_id    ON public.webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_created_at  ON public.webhook_logs(created_at DESC);

-- ─── 7. AUTO-UPDATE updated_at TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── 8. ORDER STATS VIEW (admin dashboard) ────────────────────────────────────
CREATE OR REPLACE VIEW public.order_stats AS
SELECT
  COUNT(*)                                                                             AS total_orders,
  COUNT(*) FILTER (WHERE status = 'paid')                                              AS paid_orders,
  COUNT(*) FILTER (WHERE status = 'pending')                                           AS pending_orders,
  COUNT(*) FILTER (WHERE status = 'failed')                                            AS failed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled')                                         AS cancelled_orders,
  COUNT(*) FILTER (WHERE status = 'refunded')                                          AS refunded_orders,
  COALESCE(SUM(paid_amount)   FILTER (WHERE status = 'paid'), 0)                       AS total_revenue,
  COALESCE(AVG(paid_amount)   FILTER (WHERE status = 'paid'), 0)                       AS avg_order_value,
  COALESCE(SUM(delivery_cost) FILTER (WHERE status = 'paid' AND include_delivery), 0)  AS total_delivery_collected,
  COALESCE(SUM(paid_amount)   FILTER (
    WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'
  ), 0)                                                                                AS revenue_last_30_days
FROM public.orders;

-- ─── 9. GRANTS ────────────────────────────────────────────────────────────────
GRANT ALL ON TABLE public.products         TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.product_variants TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.settings         TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.orders           TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.webhook_logs     TO anon, authenticated, service_role;
GRANT SELECT ON public.order_stats         TO anon, authenticated, service_role;

-- ─── 10. SEED DATA ────────────────────────────────────────────────────────────

-- Settings
INSERT INTO public.settings (id, key, value, description, updated_at) VALUES
  ('705f0931-ee30-4a63-8956-8e3ae06f76f6', 'delivery_cost',         '50.00', 'Standard delivery cost in ZAR',        NOW()),
  ('e1e0f6eb-ce7b-4e9a-8647-c9e298df165a', 'bulk_discount_enabled', 'true',  'Enable bulk pricing for resellers',     NOW())
ON CONFLICT (key) DO NOTHING;

-- Products (restored from backup)
INSERT INTO public.products (id, name, description, image_url, is_new_arrival, fragrance_notes, created_at, updated_at) VALUES
  (
    '2f29a107-37a0-4f7b-8b86-2c5fdd261177',
    'Midnight Elegance',
    'A sophisticated blend of bergamot, jasmine, and sandalwood',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
    true,
    '{"top":["Bergamot","Black Pepper"],"heart":["Jasmine","Rose"],"base":["Sandalwood","Musk"]}',
    '2025-06-24 18:05:52.993865+00',
    '2025-06-24 18:05:52.993865+00'
  ),
  (
    'e5676055-6387-46a7-9a43-3dbbf250dfd2',
    'Ocean Breeze',
    'Fresh aquatic notes with hints of sea salt and white flowers',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
    false,
    '{"top":["Sea Salt","Citrus"],"heart":["White Flowers","Aquatic"],"base":["Driftwood","Musk"]}',
    '2025-06-24 18:05:52.993865+00',
    '2025-06-24 18:05:52.993865+00'
  ),
  (
    'aec024eb-da46-4213-a4c1-2719738a4ed9',
    'Golden Sunset',
    'Warm amber and vanilla with citrus top notes',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400',
    false,
    '{"top":["Bergamot","Grapefruit"],"heart":["Amber","Peach"],"base":["Vanilla","Tonka Bean"]}',
    '2025-06-24 18:05:52.993865+00',
    '2025-06-24 18:05:52.993865+00'
  ),
  (
    '79384727-62bf-4fe4-84b0-85acbbe25129',
    'Dolce & Gabbana',
    'Light blue perfume',
    'https://d2dalh4h075hii.cloudfront.net/wp-content/uploads/2025/05/dolce-and-gabbana-beauty-light-blue-campaign-2025-theo-james-vittoria-ceretti-lancio.jpg',
    false,
    '{"top":["Sicilian Lemon","Apple"],"heart":["Jasmine","White Rose"],"base":["Cedar","Musk"]}',
    '2025-06-24 21:19:36.964795+00',
    '2025-06-24 21:19:36.964795+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Product Variants (restored from backup)
INSERT INTO public.product_variants (id, product_id, size_ml, regular_price, bulk_price, bulk_min_quantity, stock_quantity, created_at) VALUES
  -- Midnight Elegance
  ('332a677b-aa7c-426b-8f01-361781ed1168', '2f29a107-37a0-4f7b-8b86-2c5fdd261177', 35,  65.99, 55.99, 6, 20, '2025-06-24 18:05:52.993865+00'),
  ('542b5a89-5be6-4a81-9829-4bc23450e5d1', '2f29a107-37a0-4f7b-8b86-2c5fdd261177', 50,  89.99, 75.99, 6, 25, '2025-06-24 18:05:52.993865+00'),
  ('8300adfa-5f05-4755-8570-83ca2cfede1d', '2f29a107-37a0-4f7b-8b86-2c5fdd261177', 100, 145.99, 125.99, 4, 15, '2025-06-24 18:05:52.993865+00'),
  -- Ocean Breeze
  ('a63247a6-cd71-4333-8c26-4829a4cbc7ab', 'e5676055-6387-46a7-9a43-3dbbf250dfd2', 35,  55.99, 47.99, 6, 30, '2025-06-24 18:05:52.993865+00'),
  ('c50e1c8f-f11b-412c-88d5-15f8e554118b', 'e5676055-6387-46a7-9a43-3dbbf250dfd2', 50,  75.99, 65.99, 6, 30, '2025-06-24 18:05:52.993865+00'),
  ('e2d05452-adcf-4661-b4d8-53e4cd4a2f28', 'e5676055-6387-46a7-9a43-3dbbf250dfd2', 100, 125.99, 109.99, 4, 20, '2025-06-24 18:05:52.993865+00'),
  -- Golden Sunset
  ('7a322b5d-b251-4292-ae30-084a808eac6e', 'aec024eb-da46-4213-a4c1-2719738a4ed9', 35,  69.99, 59.99, 6, 25, '2025-06-24 18:05:52.993865+00'),
  ('72368cb7-6f09-4813-a90a-9f7823f8cf9c', 'aec024eb-da46-4213-a4c1-2719738a4ed9', 50,  92.99, 79.99, 6, 20, '2025-06-24 18:05:52.993865+00'),
  ('b29f9d24-5b4a-4717-adfe-75afffa5de3a', 'aec024eb-da46-4213-a4c1-2719738a4ed9', 100, 155.99, 135.99, 4, 18, '2025-06-24 18:05:52.993865+00'),
  -- Dolce & Gabbana
  ('c04c3315-03be-48a0-9497-629fec26350a', '79384727-62bf-4fe4-84b0-85acbbe25129', 35,  0.00,   0.00,   6, 0,  '2025-06-24 21:19:37.019008+00'),
  ('d453e162-b478-4aa4-bdd2-9b379b163bbf', '79384727-62bf-4fe4-84b0-85acbbe25129', 50,  250.00, 200.00, 6, 30, '2025-06-24 21:19:37.019008+00'),
  ('538937d5-216c-40a6-bd16-be223151e459', '79384727-62bf-4fe4-84b0-85acbbe25129', 100, 0.00,   0.00,   4, 0,  '2025-06-24 21:19:37.019008+00')
ON CONFLICT (id) DO NOTHING;
