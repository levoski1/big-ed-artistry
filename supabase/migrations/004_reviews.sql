-- ── Reviews / Testimonials ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name  VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_view_reviews" ON reviews;
CREATE POLICY "anyone_view_reviews" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "users_submit_reviews" ON reviews;
CREATE POLICY "users_submit_reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());
