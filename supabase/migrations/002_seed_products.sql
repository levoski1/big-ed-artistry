-- ── Seed Products ────────────────────────────────────────────────────────
-- Run with: npx supabase db push

INSERT INTO products (name, slug, description, price, original_price, category, badge, in_stock, featured, rating)
VALUES
  (
    'Single Portrait Print',
    'single-portrait-print',
    'Premium A4 print of a single-subject hand-drawn portrait on 300gsm art paper.',
    12000, 15000, 'print', 'Sale', true, true, 5.0
  ),
  (
    'Family Portrait Bundle',
    'family-portrait-bundle',
    'A3 charcoal family portrait up to 4 subjects. Smooth canvas and medium frame included.',
    45000, NULL, 'bundle', 'Popular', true, true, 5.0
  ),
  (
    'A2 Canvas Print',
    'a2-canvas-print',
    'Museum-quality canvas print of your commissioned artwork. Ready to hang.',
    28000, NULL, 'canvas', NULL, true, false, 4.0
  ),
  (
    'Couple Portraits Bundle',
    'couple-portraits-bundle',
    'Two individual A3 charcoal portraits at a bundled rate. Perfect anniversary gift.',
    60000, 75000, 'bundle', 'Bundle', true, true, 5.0
  ),
  (
    'Premium Framed Print',
    'premium-framed-print',
    'A3 portrait print in a handcrafted wooden frame with 2mm glass protection.',
    35000, NULL, 'frame', NULL, true, false, 4.0
  ),
  (
    'Mini Portrait Print',
    'mini-portrait-print',
    'A5 pencil portrait perfect as a keepsake or gift insert.',
    7500, NULL, 'print', NULL, false, false, 4.0
  )
ON CONFLICT (slug) DO NOTHING;
