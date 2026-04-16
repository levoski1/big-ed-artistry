-- Add image_url column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Storage bucket policies for product images (bucket already exists)
DROP POLICY IF EXISTS "public_view_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admins_upload_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admins_delete_product_images" ON storage.objects;

CREATE POLICY "public_view_product_images" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
CREATE POLICY "admins_upload_product_images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth_user_role() = 'admin');
CREATE POLICY "admins_delete_product_images" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth_user_role() = 'admin');
