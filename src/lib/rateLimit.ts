/**
 * In-memory sliding window rate limiter.
 * Suitable for single-process Next.js deployments (dev + single-instance prod).
 * For multi-instance deployments, swap the store for Redis.
 */

interface RateLimitOptions {
  /** Max requests allowed within the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

// Map<key, timestamps[]>
const store = new Map<string, number[]>()

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowStart = now - options.windowMs

  const timestamps = (store.get(key) ?? []).filter(t => t > windowStart)
  timestamps.push(now)
  store.set(key, timestamps)

  const count = timestamps.length
  const allowed = count <= options.limit
  const remaining = Math.max(0, options.limit - count)
  const resetAt = (timestamps[0] ?? now) + options.windowMs

  return { allowed, remaining, resetAt }
}

/** Exposed for tests only */
export function _clearStore() {
  store.clear()
}
