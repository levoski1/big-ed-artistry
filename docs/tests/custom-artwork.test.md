# Test Cases — Custom Artwork Page (`/custom-artwork`)

## Overview

The Custom Artwork page is a 6-step commission configurator. Users select a size, canvas, frame, glass, optional write-up, and upload a reference photo. The price summary updates live. The "Add to Cart" button is only enabled when a size and photo are both provided.

---

## TC-CA-01 — Page loads correctly

**Precondition:** User navigates to `/custom-artwork`.

**Steps:**
1. Open `/custom-artwork` in a browser.

**Expected:**
- Hero banner renders with the heading "Customise Your Photos Into Stunning Artwork".
- Artwork sizes image (`/artwork_sizes.png`) is visible.
- All 6 step sections are visible: Select Art Size, Choose Canvas, Choose Frame, Choose Glass, Write-up / Caption, Upload Reference Photo.
- Price Summary sidebar shows `—` for all line items (nothing selected yet).
- "Add to Cart" button is disabled and reads "Select size & upload photo".

---

## TC-CA-02 — Size selection updates price summary

**Precondition:** Page is loaded, no size selected.

**Steps:**
1. Click the **16 × 20** size card.

**Expected:**
- The 16 × 20 card gets a gold border (selected state).
- Area is calculated as `16 × 20 = 320 in²`.
- Base Price in the sidebar = `320 × 90 = ₦28,800`.
- Canvas, Frame, Glass lines show `—` (still at "None").
- Subtotal = ₦28,800.

---

## TC-CA-03 — Canvas selection updates price

**Precondition:** Size **16 × 20** is selected (area = 320).

**Steps:**
1. Click the **Smooth** canvas card.

**Expected:**
- Smooth canvas card is highlighted.
- Canvas line in sidebar = `320 × 14 = ₦4,480`.
- Subtotal updates to ₦28,800 + ₦4,480 = ₦33,280.

---

## TC-CA-04 — Frame selection updates price

**Precondition:** Size **16 × 20** and canvas **Smooth** are selected.

**Steps:**
1. Click the **Medium** frame card.

**Expected:**
- Medium frame card is highlighted.
- Frame line = `320 × 39 = ₦12,480`.
- Subtotal = ₦28,800 + ₦4,480 + ₦12,480 = ₦45,760.

---

## TC-CA-05 — Glass selection updates price

**Precondition:** Size, canvas, and frame are selected as above.

**Steps:**
1. Click the **2mm** glass card.

**Expected:**
- 2mm glass card is highlighted.
- Glass line = `320 × 14 = ₦4,480`.
- Subtotal = ₦45,760 + ₦4,480 = ₦50,240.

---

## TC-CA-06 — Frame restrictions for compact sizes (12 × 16 and 16 × 20)

**Precondition:** No size selected.

**Steps:**
1. Select size **12 × 16**.
2. Observe the frame options.

**Expected:**
- **Large** and **Premium** frame cards are visually dimmed (opacity 0.35) and show a "not-allowed" cursor.
- Clicking Large or Premium does nothing.
- A note appears: "Some frames are unavailable for small sizes."
- **Small**, **Medium**, **Frameless**, and **None** remain selectable.

---

## TC-CA-07 — Frame restrictions for large sizes (e.g. 24 × 36)

**Precondition:** No size selected.

**Steps:**
1. Select size **24 × 36**.
2. Observe the frame options.

**Expected:**
- **Small** frame card is dimmed and unclickable.
- A note appears: "Some frames are unavailable for large sizes."
- Large, Premium, Medium, Frameless, and None remain selectable.

---

## TC-CA-08 — Frame auto-resets when size changes to incompatible

**Precondition:** Size **20 × 30** is selected, **Large** frame is selected.

**Steps:**
1. Change size to **12 × 16** (compact).

**Expected:**
- Frame selection resets to **None** automatically (Large is disabled for compact sizes).
- Frame price line returns to `—`.

---

## TC-CA-09 — Write-up toggle shows/hides textarea

**Precondition:** Page loaded.

**Steps:**
1. Click **"Yes — Add Text"** button.
2. Type a message in the textarea.
3. Click **"No — Skip"** button.

**Expected:**
- Step 1: Textarea appears below the toggle.
- Step 2: Text is accepted.
- Step 3: Textarea disappears. The typed message is cleared from view (state resets on form submit, not on toggle — textarea just hides).

---

## TC-CA-10 — Occasion dropdown

**Precondition:** Page loaded.

**Steps:**
1. Open the Occasion dropdown.
2. Select **Wedding**.

**Expected:**
- Dropdown shows all 8 options: Birthday, Wedding, Anniversary, Memorial, Graduation, Christmas, Mother's Day, Other.
- "Wedding" is selected and displayed.

---

## TC-CA-11 — Photo upload via file picker

**Precondition:** Page loaded.

**Steps:**
1. Click the upload area in Step 06.
2. Select a valid JPG or PNG file.

**Expected:**
- A preview of the image appears inside the upload zone.
- The filename is shown with a green checkmark (✓).
- Upload border changes from dashed to solid green.
- "Click to change" hint appears below the preview.

---

## TC-CA-12 — Photo upload via drag and drop

**Precondition:** Page loaded.

**Steps:**
1. Drag a JPG file over the upload zone.
2. Drop it.

**Expected:**
- File is accepted and preview renders (same as TC-CA-11).

---

## TC-CA-13 — Add to Cart button disabled without size or photo

**Precondition:** Fresh page load.

| Scenario | Size | Photo | Expected button state |
|---|---|---|---|
| A | ✗ | ✗ | Disabled — "Select size & upload photo" |
| B | ✓ | ✗ | Disabled — "Select size & upload photo" |
| C | ✗ | ✓ | Disabled — "Select size & upload photo" |
| D | ✓ | ✓ | Enabled — "+ Add to Cart" |

---

## TC-CA-14 — Successful Add to Cart

**Precondition:** Size **16 × 20**, canvas **Normal**, frame **Medium**, glass **2mm** selected; photo uploaded.

**Steps:**
1. Click **"+ Add to Cart"**.

**Expected:**
- Button text changes to **"✓ Added to Cart!"** with a green background.
- A **"View Cart →"** link appears next to the button.
- After 3 seconds, button reverts to "+ Add to Cart".
- Form resets: size deselected, canvas/frame/glass back to None, photo cleared, write-up reset to "No".
- Price Summary sidebar shows `—` again.

---

## TC-CA-15 — Price Summary "Your Selection" panel

**Precondition:** Size **20 × 24**, canvas **Crystal**, frame **Premium**, glass **3mm** selected.

**Steps:**
1. Observe the "Your Selection" panel in the sidebar.

**Expected:**
- Panel is visible (only appears when a size is selected).
- Shows: Size = 20 × 24, Canvas = Crystal, Frame = Premium, Glass = 3mm.

---

## TC-CA-16 — Custom Size WhatsApp link

**Precondition:** Page loaded.

**Steps:**
1. Click the **"Custom Size →"** button below the size grid.

**Expected:**
- Opens `https://wa.link/7o6g5r` in a new tab.

---

## TC-CA-17 — Responsive layout (mobile)

**Precondition:** Viewport width ≤ 900px.

**Steps:**
1. Resize browser to 768px wide.

**Expected:**
- Builder and sidebar stack vertically (single column).
- Size grid switches to 3 columns.
- Canvas/Frame/Glass grids switch to 2 columns.

At ≤ 640px:
- Size grid switches to 2 columns.
- Option cards maintain 2-column layout with adjusted image height (140px).

---

## TC-CA-18 — Price formula validation

**Formula:** `totalPrice = (area × 90) + (area × canvasRate) + (area × frameRate) + (area × glassRate)`

| Size | Canvas | Frame | Glass | Area | Expected Total |
|---|---|---|---|---|---|
| 12 × 16 | None (0) | None (0) | None (0) | 192 | ₦17,280 |
| 16 × 20 | Normal (13) | Small (32) | 2mm (14) | 320 | ₦49,920 |
| 24 × 36 | Crystal (16) | Premium (100) | 3mm (16) | 864 | ₦191,808 |

**Steps:** Select each combination and verify the Subtotal in the sidebar matches the expected total.

---

## TC-CA-19 — Delivery fee note

**Precondition:** Any size selected.

**Steps:**
1. Observe the note below the price breakdown.

**Expected:**
- Text reads: "Delivery fee calculated at checkout based on your location."
- No delivery fee line item is shown on this page.

---

## TC-CA-20 — Theme compatibility

**Precondition:** Theme toggle is available in the navbar.

**Steps:**
1. Switch to **Light Mode**.
2. Navigate to `/custom-artwork`.

**Expected:**
- All text, cards, and backgrounds use light-mode CSS variables.
- No hardcoded dark hex values are visible (e.g., no `#1A1815` backgrounds).
- Gold accents remain visible and legible.
