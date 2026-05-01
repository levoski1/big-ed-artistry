/**
 * @jest-environment node
 */

import { checkRateLimit, _clearStore } from '@/lib/rateLimit'
import {
  sanitizeString,
  validateEmail,
  validatePassword,
  validateName,
  validateSubject,
  validateHtml,
} from '@/lib/sanitize'

// ─── rateLimit ────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  beforeEach(() => _clearStore())

  it('allows requests within the limit', () => {
    const opts = { limit: 3, windowMs: 60_000 }
    expect(checkRateLimit('key1', opts).allowed).toBe(true)
    expect(checkRateLimit('key1', opts).allowed).toBe(true)
    expect(checkRateLimit('key1', opts).allowed).toBe(true)
  })

  it('blocks the request that exceeds the limit', () => {
    const opts = { limit: 2, windowMs: 60_000 }
    checkRateLimit('key2', opts)
    checkRateLimit('key2', opts)
    const result = checkRateLimit('key2', opts)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('returns correct remaining count', () => {
    const opts = { limit: 5, windowMs: 60_000 }
    checkRateLimit('key3', opts)
    checkRateLimit('key3', opts)
    const result = checkRateLimit('key3', opts)
    expect(result.remaining).toBe(2) // 5 - 3 = 2
  })

  it('uses separate counters for different keys', () => {
    const opts = { limit: 1, windowMs: 60_000 }
    checkRateLimit('a', opts)
    const blocked = checkRateLimit('a', opts)
    const allowed = checkRateLimit('b', opts)
    expect(blocked.allowed).toBe(false)
    expect(allowed.allowed).toBe(true)
  })

  it('expires old timestamps outside the window', () => {
    const opts = { limit: 1, windowMs: 100 } // 100ms window
    checkRateLimit('key4', opts)
    // Advance time past the window
    jest.useFakeTimers()
    jest.advanceTimersByTime(200)
    const result = checkRateLimit('key4', opts)
    expect(result.allowed).toBe(true)
    jest.useRealTimers()
  })

  it('returns a resetAt timestamp in the future', () => {
    const opts = { limit: 5, windowMs: 60_000 }
    const result = checkRateLimit('key5', opts)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })
})

// ─── sanitize ─────────────────────────────────────────────────────────────

describe('sanitizeString', () => {
  it('trims whitespace', () => expect(sanitizeString('  hello  ')).toBe('hello'))
  it('collapses internal whitespace', () => expect(sanitizeString('a  b   c')).toBe('a b c'))
  it('returns empty string for non-string', () => expect(sanitizeString(42)).toBe(''))
})

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe('user@example.com')
    expect(validateEmail('  User@Example.COM  ')).toBe('user@example.com')
  })

  it('rejects invalid emails', () => {
    expect(validateEmail('notanemail')).toBeNull()
    expect(validateEmail('@nodomain')).toBeNull()
    expect(validateEmail('no@')).toBeNull()
    expect(validateEmail('')).toBeNull()
    expect(validateEmail(null)).toBeNull()
  })

  it('rejects emails over 254 characters', () => {
    const long = 'a'.repeat(250) + '@b.com'
    expect(validateEmail(long)).toBeNull()
  })
})

describe('validatePassword', () => {
  it('accepts passwords of 8+ characters', () => {
    expect(validatePassword('password')).toBe('password')
    expect(validatePassword('a'.repeat(128))).toBe('a'.repeat(128))
  })

  it('rejects passwords under 8 characters', () => {
    expect(validatePassword('short')).toBeNull()
    expect(validatePassword('')).toBeNull()
  })

  it('rejects passwords over 128 characters', () => {
    expect(validatePassword('a'.repeat(129))).toBeNull()
  })

  it('rejects non-strings', () => {
    expect(validatePassword(12345678)).toBeNull()
  })
})

describe('validateName', () => {
  it('accepts valid names', () => {
    expect(validateName('Alice')).toBe('Alice')
    expect(validateName('  Bob Smith  ')).toBe('Bob Smith')
  })

  it('rejects empty or too-long names', () => {
    expect(validateName('')).toBeNull()
    expect(validateName('a'.repeat(101))).toBeNull()
  })

  it('rejects names with HTML tags', () => {
    expect(validateName('<script>alert(1)</script>')).toBeNull()
    expect(validateName('<b>bold</b>')).toBeNull()
  })
})

describe('validateSubject', () => {
  it('accepts valid subjects', () => {
    expect(validateSubject('Order Confirmed')).toBe('Order Confirmed')
  })

  it('rejects empty or too-long subjects', () => {
    expect(validateSubject('')).toBeNull()
    expect(validateSubject('a'.repeat(201))).toBeNull()
  })

  it('rejects subjects with HTML tags', () => {
    expect(validateSubject('<img src=x onerror=alert(1)>')).toBeNull()
  })
})

describe('validateHtml', () => {
  it('accepts valid HTML', () => {
    const html = '<p>Hello</p>'
    expect(validateHtml(html)).toBe(html)
  })

  it('rejects non-strings', () => {
    expect(validateHtml(null)).toBeNull()
    expect(validateHtml(42)).toBeNull()
  })

  it('rejects HTML over 100,000 characters', () => {
    expect(validateHtml('a'.repeat(100_001))).toBeNull()
  })
})
