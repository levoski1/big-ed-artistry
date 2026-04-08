-- ============================================================
-- Big Ed Artistry — Initial Schema
-- ============================================================

-- uuid-ossp extension removed; using built-in gen_random_uuid() instead

-- ── ENUM Types ───────────────────────────────────────────────
CREATE TYPE user_role          AS ENUM ('customer', 'admin');
CREATE TYPE product_category   AS ENUM ('print', 'canvas', 'bundle', 'frame');
CREATE TYPE order_status       AS ENUM ('pending','confirmed','in_progress','review','completed','cancelled');
CREATE TYPE payment_status     AS ENUM ('NOT_PAID','PARTIALLY_PAID','FULLY_PAID');
CREATE TYPE delivery_location  AS ENUM ('port_harcourt','rivers_state','outside_rivers');
CREATE TYPE artwork_type       AS ENUM ('custom_artwork','photo_enlargement');
CREATE TYPE order_item_type    AS ENUM ('artwork','store_product');
CREATE TYPE write_up_type      AS ENUM ('custom_message','occasion');
CREATE TYPE payment_type       AS ENUM ('full','partial');
CREATE TYPE receipt_status     AS ENUM ('pending','verified','rejected');
CREATE TYPE upload_type        AS ENUM ('artwork_reference','payment_receipt');

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      VARCHAR(255) NOT NULL,
  full_name  VARCHAR(255) NOT NULL DEFAULT 'New User',
  phone      VARCHAR(20),
  role       user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(255) NOT NULL,
  slug           VARCHAR(255) NOT NULL UNIQUE,
  description    TEXT,
  price          INTEGER NOT NULL CHECK (price >= 0),
  original_price INTEGER CHECK (original_price >= 0),
  category       product_category NOT NULL,
  badge          VARCHAR(50),
  in_stock       BOOLEAN NOT NULL DEFAULT true,
  featured       BOOLEAN NOT NULL DEFAULT false,
  rating         DECIMAL(3,2) NOT NULL DEFAULT 4.0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  order_number      VARCHAR(20) NOT NULL UNIQUE,
  status            order_status NOT NULL DEFAULT 'pending',
  payment_status    payment_status NOT NULL DEFAULT 'NOT_PAID',
  delivery_location delivery_location NOT NULL,
  delivery_address  TEXT NOT NULL,
  delivery_bus_stop VARCHAR(255) NOT NULL,
  delivery_fee      INTEGER NOT NULL CHECK (delivery_fee >= 0),
  subtotal          INTEGER NOT NULL CHECK (subtotal >= 0),
  total_amount      INTEGER NOT NULL CHECK (total_amount >= 0),
  amount_paid       INTEGER NOT NULL DEFAULT 0,
  amount_remaining  INTEGER GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_pay_status ON orders(payment_status);

-- ── Order Items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type        order_item_type NOT NULL,
  artwork_type     artwork_type,
  size_label       VARCHAR(20),
  width_inches     DECIMAL(6,2),
  height_inches    DECIMAL(6,2),
  area_sqin        DECIMAL(8,2),
  canvas_option    VARCHAR(50),
  frame_option     VARCHAR(50),
  glass_option     VARCHAR(50),
  write_up_type    write_up_type,
  write_up_content TEXT,
  product_id       UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity         INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  base_price       INTEGER NOT NULL DEFAULT 0,
  canvas_price     INTEGER NOT NULL DEFAULT 0,
  frame_price      INTEGER NOT NULL DEFAULT 0,
  glass_price      INTEGER NOT NULL DEFAULT 0,
  item_subtotal    INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_item_type_fields CHECK (
    (item_type = 'artwork' AND artwork_type IS NOT NULL) OR
    (item_type = 'store_product' AND product_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount           INTEGER NOT NULL CHECK (amount > 0),
  payment_type     payment_type NOT NULL,
  receipt_url      TEXT NOT NULL,
  status           receipt_status NOT NULL DEFAULT 'pending',
  verified_by      UUID REFERENCES profiles(id),
  verified_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON payments(status);

-- ── Uploads ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  file_name     VARCHAR(255) NOT NULL,
  storage_path  TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_type     upload_type NOT NULL,
  file_size     INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Order number generator ───────────────────────────────────
CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TEXT AS $$
DECLARE yr TEXT := TO_CHAR(NOW(), 'YYYY'); n INT;
BEGIN
  SELECT COUNT(*) INTO n FROM orders WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'BEA-' || yr || '-' || LPAD((n + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads     ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION auth_user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Profiles
DROP POLICY IF EXISTS "users_view_own_profile"       ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile"     ON profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles"     ON profiles;
DROP POLICY IF EXISTS "service_role_insert_profile"  ON profiles;
CREATE POLICY "users_view_own_profile"      ON profiles FOR SELECT USING (id = auth_user_id());
CREATE POLICY "users_update_own_profile"    ON profiles FOR UPDATE USING (id = auth_user_id()) WITH CHECK (id = auth_user_id() AND role = 'customer');
CREATE POLICY "admins_view_all_profiles"    ON profiles FOR SELECT USING (auth_user_role() = 'admin');
CREATE POLICY "service_role_insert_profile" ON profiles FOR INSERT WITH CHECK (true);

-- Products
DROP POLICY IF EXISTS "anyone_view_products"   ON products;
DROP POLICY IF EXISTS "admins_manage_products" ON products;
CREATE POLICY "anyone_view_products"   ON products FOR SELECT USING (true);
CREATE POLICY "admins_manage_products" ON products FOR ALL USING (auth_user_role() = 'admin');

-- Orders
DROP POLICY IF EXISTS "customers_view_own_orders" ON orders;
DROP POLICY IF EXISTS "customers_create_orders"   ON orders;
DROP POLICY IF EXISTS "admins_view_all_orders"    ON orders;
DROP POLICY IF EXISTS "admins_update_orders"      ON orders;
CREATE POLICY "customers_view_own_orders" ON orders FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY "customers_create_orders"   ON orders FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY "admins_view_all_orders"    ON orders FOR SELECT USING (auth_user_role() = 'admin');
CREATE POLICY "admins_update_orders"      ON orders FOR UPDATE USING (auth_user_role() = 'admin');

-- Order Items
DROP POLICY IF EXISTS "users_view_own_order_items"   ON order_items;
DROP POLICY IF EXISTS "users_insert_own_order_items" ON order_items;
DROP POLICY IF EXISTS "admins_view_all_order_items"  ON order_items;
CREATE POLICY "users_view_own_order_items"   ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth_user_id()));
CREATE POLICY "users_insert_own_order_items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth_user_id()));
CREATE POLICY "admins_view_all_order_items"  ON order_items FOR SELECT USING (auth_user_role() = 'admin');

-- Payments
DROP POLICY IF EXISTS "users_view_own_payments" ON payments;
DROP POLICY IF EXISTS "users_submit_payments"   ON payments;
DROP POLICY IF EXISTS "admins_manage_payments"  ON payments;
CREATE POLICY "users_view_own_payments" ON payments FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY "users_submit_payments"   ON payments FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY "admins_manage_payments"  ON payments FOR ALL USING (auth_user_role() = 'admin');

-- Uploads
DROP POLICY IF EXISTS "users_view_own_uploads"  ON uploads;
DROP POLICY IF EXISTS "users_insert_uploads"    ON uploads;
DROP POLICY IF EXISTS "admins_view_all_uploads" ON uploads;
CREATE POLICY "users_view_own_uploads"  ON uploads FOR SELECT USING (user_id = auth_user_id());
CREATE POLICY "users_insert_uploads"    ON uploads FOR INSERT WITH CHECK (user_id = auth_user_id());
CREATE POLICY "admins_view_all_uploads" ON uploads FOR SELECT USING (auth_user_role() = 'admin');

-- ── Storage Policies ─────────────────────────────────────────
CREATE POLICY "users_upload_artwork" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'artwork-references' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users_view_own_artwork" ON storage.objects FOR SELECT
  USING (bucket_id = 'artwork-references' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth_user_role() = 'admin'));
CREATE POLICY "users_upload_receipts" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "users_view_own_receipts" ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-receipts' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth_user_role() = 'admin'));
CREATE POLICY "public_view_product_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "admins_upload_product_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth_user_role() = 'admin');
