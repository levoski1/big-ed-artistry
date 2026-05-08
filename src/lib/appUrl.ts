// Module-level cache for the statically configured URL only
let _cachedUrl: string | null = null

/**
 * Resolve the app URL from environment variables.
 * Precedence:
 *   1. NEXT_PUBLIC_APP_URL  (explicitly configured, highest priority)
 *   2. NEXT_PUBLIC_SITE_URL (commonly set for SEO / canonical)
 *   3. NEXT_PUBLIC_VERCEL_URL (auto-set by Vercel to the deployment URL)
 *   4. http://localhost:3000 (development / test only)
 *
 * Safety: if NODE_ENV is 'production' and the resolved value contains
 * 'localhost', the URL is rejected and undefined is returned so the
 * caller never accidentally sends localhost links to real users.
 */
function resolveAppUrl(): string | undefined {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL

  if (url) {
    if (process.env.NODE_ENV === 'production' && /localhost/i.test(url)) {
      console.error(
        '[appUrl] Rejected localhost URL in production. ' +
          'Set NEXT_PUBLIC_APP_URL to your live domain.'
      )
      return undefined
    }
    return url
  }

  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? 'http://localhost:3000'
    : undefined
}

/**
 * Dynamic fallback — derive the app URL from the current HTTP request headers.
 * Only used when every environment-based source has failed.
 */
function resolveDynamicUrl(): string {
  try {
    const { headers } = require('next/headers') as typeof import('next/headers')
    const hdrs = headers()
    const host = hdrs.get('x-forwarded-host') || hdrs.get('host')
    if (host) {
      const proto = hdrs.get('x-forwarded-proto') || 'https'
      return `${proto}://${host}`.replace(/\/+$/, '')
    }
  } catch {
    // Not in a request context (build-time, static generation, etc.)
  }
  return ''
}

/**
 * Return the application's base URL with no trailing slash.
 *
 * Resolution order:
 *   1. Cached value from a previous call in the same request/process
 *   2. Static environment-based URL (APP_URL / SITE_URL / VERCEL_URL)
 *   3. Dynamic URL derived from the current request's Host header
 *
 * Returns an empty string only when every source has been exhausted,
 * which should never happen in a running server.
 */
export function getAppUrl(): string {
  if (_cachedUrl !== null) return _cachedUrl

  const url = resolveAppUrl()
  if (url) {
    _cachedUrl = url.replace(/\/+$/, '')
    return _cachedUrl
  }

  // Environment variables are missing — fall back to the request host.
  // This is intentionally NOT cached because the same process may serve
  // different hosts (e.g. during a migration, behind a reverse-proxy, etc.).
  const dynamic = resolveDynamicUrl()
  if (dynamic) return dynamic

  _cachedUrl = ''
  return ''
}

/**
 * Build a fully-qualified URL for the given path.
 *
 * Example:  url('/dashboard/orders')  →  'https://bigedartistry.com/dashboard/orders'
 *
 * When the base URL cannot be determined the bare path is returned,
 * which degrades gracefully where absolute URLs are expected.
 */
export function url(path: string): string {
  const base = getAppUrl()
  if (!base) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

/**
 * Clear the module-level URL cache.
 * Used in tests between env-var changes.
 */
export function resetAppUrlCache(): void {
  _cachedUrl = null
}
