# Tests — Admin Authentication

Covers the admin login page at `/admin`.

**Test file**
- `src/__tests__/pages/AdminLoginPage.test.tsx`

---

## Admin Login Page (`/admin`)

| Test | What it checks |
|------|----------------|
| Heading renders | "Admin Sign In" heading is present |
| "Admin Panel" label | Restricted-access label is visible |
| Empty submit shows error | "Please enter your credentials." shown when fields are blank |
| Non-admin role blocked | If `getCurrentUser()` returns `role: 'customer'`, shows "Access denied. Admin accounts only." |
| Admin role redirects | If `getCurrentUser()` returns `role: 'admin'`, `router.push('/admin/dashboard')` is called |
| Server error displayed | Error thrown by `login` action is shown to the user |
| Back-to-site link | "← Back to main site" link points to `/` |

---

## Key behaviour: role check

The admin login performs a **two-step check**:
1. Calls `login(email, password)` — authenticates the user via Supabase.
2. Calls `getCurrentUser()` — fetches the profile and checks `role === 'admin'`.

If step 2 returns any role other than `'admin'`, the session is effectively rejected and the error "Access denied. Admin accounts only." is shown. This means a valid customer account cannot access the admin panel even with correct credentials.

---

## Mocks

| Module | Mock |
|--------|------|
| `next/link` | Plain `<a>` tag |
| `next/navigation` | `useRouter` returns `{ push, refresh }` jest fns |
| `@/components/ui` | `FormGroup`, `Input`, `GoldLine` — minimal HTML wrappers |
| `@/app/actions/auth` | `login` and `getCurrentUser` are `jest.fn()` — resolved/rejected per test |
