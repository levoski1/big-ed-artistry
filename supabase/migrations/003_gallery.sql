-- ── Gallery Items ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  medium      VARCHAR(100) NOT NULL DEFAULT 'Pencil on Paper',
  size        VARCHAR(50),
  year        INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  category    VARCHAR(50) NOT NULL DEFAULT 'portrait',
  image_url   TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  description TEXT,
  featured    BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery_items(featured);

DROP TRIGGER IF EXISTS trg_gallery_updated_at ON gallery_items;
CREATE TRIGGER trg_gallery_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Public can view gallery
DROP POLICY IF EXISTS "anyone_view_gallery" ON gallery_items;
CREATE POLICY "anyone_view_gallery" ON gallery_items FOR SELECT USING (true);

-- Only admins can manage gallery
DROP POLICY IF EXISTS "admins_manage_gallery" ON gallery_items;
CREATE POLICY "admins_manage_gallery" ON gallery_items FOR ALL USING (auth_user_role() = 'admin');

-- Storage bucket policy for gallery images
CREATE POLICY "public_view_gallery_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-images');
CREATE POLICY "admins_upload_gallery_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery-images' AND auth_user_role() = 'admin');
CREATE POLICY "admins_delete_gallery_images" ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery-images' AND auth_user_role() = 'admin');
