# Test Cases — Photo Enlargement Page (`/photo-enlarge`)

## Overview

The Photo Enlargement page lets users turn any personal photo into a premium wall art piece. The flow differs from Custom Artwork in one key way: **photo upload is Step 01** (before size selection). The same canvas, frame, and glass options apply, with the same frame restriction rules. A live before/after preview panel in the hero updates as soon as a photo is uploaded.

---

## TC-PE-01 — Page loads correctly

**Precondition:** User navigates to `/photo-enlarge`.

**Steps:**
1. Open `/photo-enlarge` in a browser.

**Expected:**
- Hero section renders with heading "Your Story, Beautifully Brought to Life".
- Three feature callouts are visible: "📸 Upload First", "⚡ 1–2 Weeks", "🖼️ Full Custom".
- Before/After panel shows placeholder icons (no photo uploaded yet).
- All 6 step sections are visible: Upload Your Photo, Select Size, Choose Canvas, Choose Frame, Choose Glass, Write-up / Caption.
- Live Summary sidebar shows `—` for size and subtotal.
- "Add to Cart" button is disabled and reads "Upload photo & select size first".

---

## TC-PE-02 — Before/After preview updates on photo upload

**Precondition:** Page loaded, no photo uploaded.

**Steps:**
1. Upload a JPG photo via the Step 01 upload zone.

**Expected:**
- Left panel of the hero before/after grid shows the original photo.
- Right panel shows the same photo with a sepia/contrast filter applied (artwork simulation).
- A gold diagonal pattern overlay is visible on the right panel.
- An "Artwork" label appears in the bottom-right corner of the right panel.
- The Live Summary sidebar shows a thumbnail of the photo with the sepia filter.

---

## TC-PE-03 — Photo upload via file picker (Step 01)

**Precondition:** Page loaded.

**Steps:**
1. Click the upload zone in Step 01.
2. Select a valid image file (JPG, PNG, or WEBP).

**Expected:**
- Image preview renders inside the upload zone (max height 180px).
- Filename shown with green checkmark (✓).
- Upload border changes to solid green.
- "Click to change" hint appears.

---

## TC-PE-04 — Photo upload via drag and drop

**Precondition:** Page loaded.

**Steps:**
1. Drag an image file over the Step 01 upload zone.
2. Observe the zone while dragging.
3. Drop the file.

**Expected:**
- While dragging: border changes to dashed gold (`var(--gold-primary)`), background tints gold.
- After drop: file is accepted, preview renders (same as TC-PE-03).

---

## TC-PE-05 — Drag leave resets upload zone style

**Precondition:** Page loaded.

**Steps:**
1. Drag a file over the upload zone.
2. Drag it back out without dropping.

**Expected:**
- Upload zone returns to its default dashed border and background.

---

## TC-PE-06 — Size selection updates Live Summary and price

**Precondition:** Photo uploaded, no size selected.

**Steps:**
1. Click the **16 × 20** size card.

**Expected:**
- 16 × 20 card gets a gold border.
- Area = `16 × 20 = 320 in²`.
- Base Price = `320 × 90 = ₦28,800`.
- Subtotal in sidebar = ₦28,800.
- Size row in Live Summary shows "16 × 20".

---

## TC-PE-07 — Photo Enlargement has more size options than Custom Artwork

**Precondition:** Page loaded.

**Steps:**
1. Count the size cards in Step 02.

**Expected:**
- 9 size options are available: 8 × 10, 10 × 12, 12 × 16, 16 × 20, 16 × 24, 20 × 24, 20 × 30, 24 × 36, 36 × 48.
- (Custom Artwork only has 7 — it starts at 12 × 16.)

---

## TC-PE-08 — Canvas selection updates price

**Precondition:** Size **16 × 20** selected (area = 320).

**Steps:**
1. Click **Crystal** canvas.

**Expected:**
- Crystal card highlighted.
- Canvas price = `320 × 16 = ₦5,120`.
- Subtotal = ₦28,800 + ₦5,120 = ₦33,920.
- Live Summary sidebar shows "Canvas: Crystal".

---

## TC-PE-09 — Frame selection updates price

**Precondition:** Size **16 × 20**, canvas **Crystal** selected.

**Steps:**
1. Click **Large** frame.

**Expected:**
- Large frame card highlighted.
- Frame price = `320 × 75 = ₦24,000`.
- Subtotal = ₦33,920 + ₦24,000 = ₦57,920.

---

## TC-PE-10 — Glass selection updates price

**Precondition:** Size, canvas, and frame selected as above.

**Steps:**
1. Click **3mm** glass.

**Expected:**
- 3mm glass card highlighted.
- Glass price = `320 × 16 = ₦5,120`.
- Subtotal = ₦57,920 + ₦5,120 = ₦63,040.

---

## TC-PE-11 — Frame restrictions for compact sizes (8 × 10, 10 × 12, 12 × 16, 16 × 20)

**Precondition:** No size selected.

**Steps:**
1. Select size **8 × 10**.
2. Observe frame options.

**Expected:**
- **Large** and **Premium** frame cards are dimmed (opacity 0.35) and unclickable.
- Note appears: "Some frames are unavailable for small sizes."
- Small, Medium, Frameless, and None remain selectable.

---

## TC-PE-12 — Frame restrictions for large sizes (e.g. 24 × 36)

**Precondition:** No size selected.

**Steps:**
1. Select size **24 × 36**.
2. Observe frame options.

**Expected:**
- **Small** frame card is dimmed and unclickable.
- Note appears: "Some frames are unavailable for large sizes."

---

## TC-PE-13 — Frame auto-resets when size changes to incompatible

**Precondition:** Size **20 × 30** selected, **Large** frame selected.

**Steps:**
1. Change size to **10 × 12** (compact).

**Expected:**
- Frame resets to **None** automatically.
- Frame price line returns to `—`.

---

## TC-PE-14 — Write-up toggle shows/hides textarea

**Precondition:** Page loaded.

**Steps:**
1. Click **"Yes — Add Text"**.
2. Type a caption.
3. Click **"No — Skip"**.

**Expected:**
- Textarea appears on "Yes".
- Textarea disappears on "No".

---

## TC-PE-15 — Occasion dropdown

**Precondition:** Page loaded.

**Steps:**
1. Open the Occasion dropdown in Step 06.

**Expected:**
- 8 options available: Birthday, Wedding, Anniversary, Memorial, Graduation, Christmas, Mother's Day, Other.
- Default is "Birthday".

---

## TC-PE-16 — Add to Cart button requires both photo and size

| Scenario | Photo | Size | Expected button state |
|---|---|---|---|
| A | ✗ | ✗ | Disabled — "Upload photo & select size first" |
| B | ✓ | ✗ | Disabled — "Upload photo & select size first" |
| C | ✗ | ✓ | Disabled — "Upload photo & select size first" |
| D | ✓ | ✓ | Enabled — "+ Add to Cart" |

---

## TC-PE-17 — Successful Add to Cart

**Precondition:** Photo uploaded, size **12 × 16** selected, canvas **Normal**, frame **Medium**, glass **None**.

**Steps:**
1. Click **"+ Add to Cart"**.

**Expected:**
- Button changes to **"✓ Added to Cart!"** with green background.
- **"View Cart →"** link appears.
- After 3 seconds, button reverts to "+ Add to Cart".
- Cart item is created with `artworkType: 'enlargement'` and an ID prefixed `ENL-`.

> **Note:** Unlike Custom Artwork, the Photo Enlargement form does **not** reset after adding to cart — the photo and selections remain so the user can add another size variant if desired.

---

## TC-PE-18 — Live Summary sidebar thumbnail

**Precondition:** Photo uploaded, size and options selected.

**Steps:**
1. Observe the Live Summary sidebar.

**Expected:**
- A thumbnail of the uploaded photo is shown with sepia filter.
- Below the thumbnail: "Canvas: [name] · Frame: [name]" label.
- Size, Canvas, Frame, Glass rows all reflect current selections.

---

## TC-PE-19 — Price formula validation

**Formula:** `totalPrice = (area × 90) + (area × canvasRate) + (area × frameRate) + (area × glassRate)`

| Size | Canvas | Frame | Glass | Area | Expected Total |
|---|---|---|---|---|---|
| 8 × 10 | None (0) | None (0) | None (0) | 80 | ₦7,200 |
| 10 × 12 | Smooth (14) | Small (32) | 2mm (14) | 120 | ₦18,000 |
| 36 × 48 | Crystal (16) | Premium (100) | 3mm (16) | 1728 | ₦383,616 |

**Steps:** Select each combination and verify the Subtotal matches.

---

## TC-PE-20 — Responsive layout (mobile)

**Precondition:** Viewport ≤ 900px.

**Steps:**
1. Resize browser to 768px.

**Expected:**
- Hero grid (text + before/after panel) stacks vertically.
- Builder and sidebar stack vertically.
- Size grid: 3 columns.
- Option grids: 2 columns.

At ≤ 640px:
- Size grid: 2 columns.
- Option card image height: 140px.

---

## TC-PE-21 — Theme compatibility

**Steps:**
1. Switch to **Light Mode** via the navbar toggle.
2. Navigate to `/photo-enlarge`.

**Expected:**
- All backgrounds, text, and borders use light-mode CSS variables.
- Gold accents remain visible.
- Before/after panel renders correctly in light mode.
