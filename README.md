# Big Ed Artistry — Frontend

Custom hand-drawn art platform built with **Next.js 14 (App Router)**, **TypeScript**, and **React**.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Inline styles + CSS variables (Aurum Gold design system) |
| Fonts | Cormorant Garamond (display) · Libre Franklin (body) |
| Data | Mock data in `src/lib/mockData.ts` (swap for real API) |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.tsx           Landing Page
│   │   ├── gallery/           Gallery with fullscreen viewer
│   │   ├── services/          Services & pricing
│   │   ├── custom-artwork/    Multi-step order form
│   │   ├── photo-enlarge/     Enlargement configurator
│   │   ├── store/             Product shop
│   │   ├── product/[slug]/    Product detail
│   │   ├── about/             Artist story
│   │   └── contact/           Contact & FAQ
│   ├── (auth)/            # Auth pages (no nav/footer)
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Customer portal
│   │   ├── page.tsx           Dashboard home
│   │   ├── orders/            My orders + detail panel
│   │   ├── payments/          Payment proof upload
│   │   └── profile/           Profile & password
│   ├── admin/             # Admin panel
│   │   ├── page.tsx           Admin login
│   │   ├── dashboard/         Stats overview
│   │   ├── orders/            Order management
│   │   ├── products/          Product CRUD
│   │   ├── customers/         Customer directory
│   │   └── settings/          Payment verification + settings
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/            PublicLayout
│   ├── navigation/        Navbar, Footer
│   ├── ui/                Button, Badge, StatusBadge, Input, etc.
│   └── dashboard/         DashboardSidebar, AdminSidebar
├── lib/
│   ├── mockData.ts        All seed data
│   └── tokens.ts          Design tokens + utility functions
└── types/
    └── index.ts           All TypeScript interfaces
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open in browser
http://localhost:3000
```

---

## Page Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/gallery` | Artwork gallery with filter + fullscreen viewer |
| `/services` | Services overview + pricing tiers |
| `/custom-artwork` | 3-step commission order form |
| `/photo-enlarge` | Photo enlargement configurator |
| `/store` | Product shop |
| `/product/[slug]` | Product detail |
| `/about` | Artist biography |
| `/contact` | Contact form + FAQ |
| `/login` | Customer login |
| `/register` | Customer registration |
| `/dashboard` | Customer dashboard home |
| `/dashboard/orders` | My orders + status timeline |
| `/dashboard/payments` | Upload payment proof |
| `/dashboard/profile` | Edit profile + change password |
| `/admin` | Admin login |
| `/admin/dashboard` | Admin stats overview |
| `/admin/orders` | Orders management |
| `/admin/products` | Product CRUD |
| `/admin/customers` | Customer directory |
| `/admin/settings` | Payment verification + settings |

---

## Design System

All design tokens live in `src/app/globals.css` as CSS variables:

```css
--gold-primary: #B8860B
--gold-light:   #D4A84B
--gold-accent:  #C9A227
--bg-dark:      #0F0E0C
--bg-card:      #1A1815
--text-primary: #F5F0E8
--text-secondary: #A69F94
--border-color: #2A2622
```

---

## Connecting a Real Backend

Replace the mock data imports in each page with real API calls:

```typescript
// Before (mock)
import { mockOrders } from '@/lib/mockData'

// After (real API)
const orders = await fetch('/api/orders').then(r => r.json())
```

The service layer stubs are in `src/services/` — ready to be wired up to your backend.

---

## Next Steps

- [ ] Wire up API routes (`/api/orders`, `/api/products`, etc.)
- [ ] Add `next-auth` for real authentication
- [ ] Add Framer Motion for scroll-reveal animations
- [ ] Connect image upload to Cloudinary or S3
- [ ] Add real payment processing (Paystack / Flutterwave)

---

## Light / Dark Mode

The app ships with a full theme system. A toggle pill in the navbar switches between modes.

### How it works

The theme is controlled via a CSS class on `<html>`:
- **Dark mode**: `html.theme-dark` (default)
- **Light mode**: `html.theme-light`

Both classes are defined in `globals.css` with complete sets of CSS variables:

```css
html.theme-dark { --bg-dark: #0F0E0C; --text-primary: #F5F0E8; ... }
html.theme-light { --bg-dark: #FAF8F4; --text-primary: #1C1A17; ... }
```

### Files involved

| File | Role |
|------|------|
| `src/context/ThemeContext.tsx` | `ThemeProvider` + `useTheme()` hook |
| `src/app/layout.tsx` | Wraps app in `ThemeProvider`; inline script prevents flash |
| `src/app/globals.css` | Dual CSS variable sets + `.theme-toggle` pill styles |
| `src/components/navigation/Navbar.tsx` | `ThemeToggle` component — pill with sun/moon icons |

### No-flash strategy

`layout.tsx` includes an inline `<script>` that reads `localStorage('biged_theme')` and applies the class to `<html>` *before React hydrates* — so the correct theme is applied on first paint with zero flicker.

### Adding new colours

Always use CSS variables instead of hex values:

```tsx
// ✅ Correct — adapts to both themes
style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}

// ❌ Wrong — breaks in light mode
style={{ background: '#1A1815', color: '#F5F0E8' }}
```

For text on gold/gradient buttons, use `var(--text-on-gold)` which is `#0F0E0C` in dark and `#FFFFFF` in light.
