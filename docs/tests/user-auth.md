# Tests — User Authentication & Dashboard

Covers the customer-facing auth flow (login, register) and the dashboard home.

**Test files**
- `src/__tests__/pages/UserAuth.test.tsx` — Login + Register pages
- `src/__tests__/pages/DashboardPageContent.test.tsx` — Dashboard home

---

## Login Page (`/login`)

| Test | What it checks |
|------|----------------|
| Heading renders | "Sign In" heading is present |
| Fields render | Email and password inputs are visible |
| Empty submit shows error | Submitting with no input shows "Please fill in all fields." |
| Calls login action | `login(email, password)` is called with the entered values |
| Shows server error | Error thrown by the `login` action is displayed to the user |
| Register link present | "Register here" link points to `/register` |

---

## Register Page (`/register`)

| Test | What it checks |
|------|----------------|
| Heading renders | "Create Account" heading is present |
| Empty submit shows error | "Please fill in all required fields." shown when fields are blank |
| Password mismatch | "Passwords do not match." shown when confirm differs |
| Password too short | "Password must be at least 8 characters." enforced client-side |
| Terms not agreed | "Please agree to the terms." shown when checkbox is unchecked |
| Calls register action | `register({ email, full_name })` called with correct data on valid form |
| Confirmation screen | "Check Your Email" screen shown after successful registration |
| Login link present | "Sign in" link points to `/login` |

---

## Dashboard Home (`/dashboard`)

| Test | What it checks |
|------|----------------|
| Greets by first name | "Welcome back, Jane" extracted from `user.full_name` |
| Order count stat | Total orders count displayed in the stats row |
| Empty state | "No orders yet" shown when `orders` array is empty |
| Order number & amount | `order_number` and formatted `total_amount` rendered in the table |
| Pay link for unpaid | Orders with `payment_status: NOT_PAID` show a Pay → link to `/dashboard/payments` |
| Quick action links | Commission New Art → `/custom-artwork`, Upload Payment → `/dashboard/payments` |
| Null user fallback | Renders "Welcome back, there" when `user` prop is `null` |

---

## Mocks

| Module | Mock |
|--------|------|
| `next/link` | Plain `<a>` tag |
| `next/navigation` | `useRouter` returns `{ push, refresh }` jest fns; `useSearchParams` returns `{ get: () => null }` |
| `@/components/ui` | `FormGroup`, `Input`, `GoldLine`, `StatusBadge` — minimal HTML wrappers |
| `@/app/actions/auth` | `login` and `register` are `jest.fn()` — resolved/rejected per test |
| `@/lib/tokens` | `formatPrice` and `formatDate` return simple strings |
