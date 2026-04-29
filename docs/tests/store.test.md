# Test Cases — Store / Shop Page (`/store`)

## Overview

The Store page displays a product grid fetched from the database. Users can filter by category, view product details (name, description, price, badge, rating), and add in-stock items to the cart. Out-of-stock products show an overlay and a disabled button.

---

## TC-ST-01 — Page loads correctly

**Precondition:** User navigates to `/store`.

**Steps:**
1. Open `/store` in a browser.

**Expected:**
- Page hero renders with tag "Store" and heading "Art Products & Prints".
- Subtitle is visible: "Browse portrait prints, canvas wraps, frames, and bundles…"
- Category filter bar is visible with buttons: All Products, Print, Canvas, Bundle, Frame.
- "All Products" filter is active by default (gold background).
- Product count is shown (e.g., "12 products").
- Product grid renders with up to 3 columns.

---

## TC-ST-02 — All products shown by default

**Precondition:** Page loaded.

**Steps:**
1. Observe the product grid with "All Products" filter active.

**Expected:**
- Every product in the database is displayed regardless of category.
- Product count label matches the number of cards rendered.

---

## TC-ST-03 — Category filter — Print

**Precondition:** Page loaded, "All Products" active.

**Steps:**
1. Click the **Print** filter button.

**Expected:**
- Only products with `category === 'print'` are shown.
- Print button becomes active (gold background).
- Product count updates to reflect filtered results.
- All Products button returns to inactive state.

---

## TC-ST-04 — Category filter — Canvas

**Steps:**
1. Click the **Canvas** filter button.

**Expected:**
- Only products with `category === 'canvas'` are shown.
- Canvas button is active.

---

## TC-ST-05 — Category filter — Bundle

**Steps:**
1. Click the **Bundle** filter button.

**Expected:**
- Only products with `category === 'bundle'` are shown.

---

## TC-ST-06 — Category filter — Frame

**Steps:**
1. Click the **Frame** filter button.

**Expected:**
- Only products with `category === 'frame'` are shown.

---

## TC-ST-07 — Empty state for category with no products

**Precondition:** A category exists that has no products in the database.

**Steps:**
1. Click a filter button for an empty category.

**Expected:**
- Product grid is replaced by an empty state:
  - Diamond icon (◇) is displayed.
  - Text reads: "No products in this category yet."
- Product count shows "0 products".

---

## TC-ST-08 — Product card renders all fields

**Precondition:** At least one product exists with all fields populated.

**Steps:**
1. Observe a product card in the grid.

**Expected:**
- Product image fills the 200px image area (object-fit: cover).
- Category label shown in uppercase above the product name.
- Product name in Cormorant Garamond serif font.
- Description text is visible.
- Price shown in gold (e.g., ₦12,500).
- If `original_price` exists, it is shown with a strikethrough next to the current price.
- "Add to Cart" button is visible and enabled.

---

## TC-ST-09 — Product card with no image shows placeholder

**Precondition:** A product exists with `image_url = null`.

**Steps:**
1. Observe the product card.

**Expected:**
- Image area shows a faint gold rectangle SVG placeholder icon.
- No broken image icon is shown.

---

## TC-ST-10 — Badge renders on product card

**Precondition:** A product has a `badge` value (e.g., "Best Seller").

**Steps:**
1. Observe the product card.

**Expected:**
- Badge label appears as a gold pill in the top-left corner of the image area.
- Text is uppercase, small font.

---

## TC-ST-11 — Out-of-stock product

**Precondition:** A product has `in_stock = false`.

**Steps:**
1. Observe the product card.

**Expected:**
- A semi-transparent dark overlay covers the image area.
- "Out of Stock" text is centered on the overlay.
- The "Add to Cart" button is disabled and reads "Out of Stock".
- Button has a dark background and muted text color.
- Clicking the button does nothing.

---

## TC-ST-12 — Add to Cart — in-stock product

**Precondition:** At least one product is in stock.

**Steps:**
1. Click **"+ Add to Cart"** on an in-stock product.

**Expected:**
- `addStoreItem` is called with the correct product data: `id`, `name`, `slug`, `description`, `price`, `originalPrice`, `category`, `badge`, `inStock`, `featured`, `rating`.
- Cart context is updated (cart count in navbar increments if visible).
- No page navigation occurs.

---

## TC-ST-13 — Add to Cart — multiple items

**Precondition:** Multiple in-stock products are visible.

**Steps:**
1. Click "Add to Cart" on Product A.
2. Click "Add to Cart" on Product B.
3. Click "Add to Cart" on Product A again.

**Expected:**
- Cart contains both products.
- Adding Product A a second time either increments its quantity or adds a second entry, depending on CartContext implementation.

---

## TC-ST-14 — Original price strikethrough display

**Precondition:** A product has both `price` and `original_price` set (e.g., price = ₦10,000, original_price = ₦15,000).

**Steps:**
1. Observe the price area of the product card.

**Expected:**
- Current price (₦10,000) is shown in gold, larger font.
- Original price (₦15,000) is shown in muted color with `text-decoration: line-through`.
- Both prices are on the same line.

---

## TC-ST-15 — Responsive layout — tablet (≤ 900px)

**Precondition:** Viewport width ≤ 900px.

**Steps:**
1. Resize browser to 768px.

**Expected:**
- Product grid switches from 3 columns to 2 columns.
- Category filter buttons wrap if needed.

---

## TC-ST-16 — Responsive layout — mobile (≤ 540px)

**Precondition:** Viewport width ≤ 540px.

**Steps:**
1. Resize browser to 375px.

**Expected:**
- Product grid switches to 1 column.
- Each product card takes full width.

---

## TC-ST-17 — Product count label accuracy

**Precondition:** "Canvas" filter is active and shows 4 products.

**Steps:**
1. Observe the count label in the filter bar.

**Expected:**
- Label reads "4 products".
- Switching to "All Products" updates the count to the total number of products.

---

## TC-ST-18 — Theme compatibility

**Steps:**
1. Switch to **Light Mode** via the navbar toggle.
2. Navigate to `/store`.

**Expected:**
- Page hero, filter bar, and product cards all use light-mode CSS variables.
- Gold accents (badges, prices, active filter) remain visible and legible.
- No hardcoded dark hex values are visible.
