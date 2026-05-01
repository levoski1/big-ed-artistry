/**
 * @jest-environment node
 */

import { toUserMessage, ERR } from '@/lib/errorMessages'

describe('toUserMessage — network errors', () => {
  it.each([
    'fetch failed',
    'Connect Timeout Error',
    'ECONNREFUSED 127.0.0.1:5432',
    'UND_ERR_CONNECT_TIMEOUT',
    'network error occurred',
  ])('maps "%s" to NETWORK', (raw) => {
    expect(toUserMessage(new Error(raw))).toBe(ERR.NETWORK)
  })
})

describe('toUserMessage — auth errors', () => {
  it('maps Invalid login credentials', () => {
    expect(toUserMessage(new Error('Invalid login credentials'))).toBe(ERR.INVALID_CREDENTIALS)
  })
  it('maps Email not confirmed', () => {
    expect(toUserMessage(new Error('Email not confirmed'))).toBe(ERR.EMAIL_NOT_CONFIRMED)
  })
  it('maps User already registered', () => {
    expect(toUserMessage(new Error('User already registered'))).toBe(ERR.EMAIL_EXISTS)
  })
  it('maps Password should be', () => {
    expect(toUserMessage(new Error('Password should be at least 6 characters'))).toBe(ERR.WEAK_PASSWORD)
  })
})

describe('toUserMessage — rate limiting', () => {
  it('maps rate limit', () => {
    expect(toUserMessage(new Error('rate limit exceeded'))).toBe(ERR.RATE_LIMITED)
  })
  it('maps too many', () => {
    expect(toUserMessage(new Error('too many requests'))).toBe(ERR.RATE_LIMITED)
  })
})

describe('toUserMessage — session errors', () => {
  it('maps SESSION_EXPIRED', () => {
    expect(toUserMessage(new Error('SESSION_EXPIRED'))).toBe(ERR.SESSION_EXPIRED)
  })
  it('maps Not authenticated', () => {
    expect(toUserMessage(new Error('Not authenticated'))).toBe(ERR.SESSION_EXPIRED)
  })
  it('maps JWT expired', () => {
    expect(toUserMessage(new Error('JWT expired'))).toBe(ERR.SESSION_EXPIRED)
  })
  it('maps foreign key violation to SESSION_EXPIRED', () => {
    expect(toUserMessage(new Error('violates foreign key constraint "user_id_fkey"'))).toBe(ERR.SESSION_EXPIRED)
  })
})

describe('toUserMessage — DB/storage errors', () => {
  it('maps duplicate key to ORDER_DUPLICATE', () => {
    expect(toUserMessage(new Error('duplicate key value violates unique constraint'))).toBe(ERR.ORDER_DUPLICATE)
  })
  it('maps storage error to UPLOAD_FAILED', () => {
    expect(toUserMessage(new Error('storage bucket not found'))).toBe(ERR.UPLOAD_FAILED)
  })
  it('maps row-level security to PERMISSION_DENIED', () => {
    expect(toUserMessage(new Error('new row violates row-level security policy'))).toBe(ERR.PERMISSION_DENIED)
  })
  it('maps permission denied to PERMISSION_DENIED', () => {
    expect(toUserMessage(new Error('permission denied for table orders'))).toBe(ERR.PERMISSION_DENIED)
  })
})

describe('toUserMessage — raw errors never exposed', () => {
  it.each([
    'MongoError: duplicate key error collection',
    'PostgreSQL error: relation "users" does not exist',
    'TypeError: Cannot read properties of undefined',
    'Internal server error: stack trace at line 42',
  ])('does not expose raw error: "%s"', (raw) => {
    const result = toUserMessage(new Error(raw))
    expect(Object.values(ERR)).toContain(result)
    expect(result).not.toContain('MongoError')
    expect(result).not.toContain('PostgreSQL')
    expect(result).not.toContain('TypeError')
    expect(result).not.toContain('stack trace')
  })
})

describe('toUserMessage — fallback', () => {
  it('returns GENERIC for unknown errors', () => {
    expect(toUserMessage(new Error('some completely unknown error xyz'))).toBe(ERR.GENERIC)
  })
  it('accepts a custom fallback', () => {
    expect(toUserMessage(new Error('unknown xyz'), 'Custom fallback')).toBe('Custom fallback')
  })
  it('handles non-Error thrown values', () => {
    expect(toUserMessage('string error')).toBe(ERR.GENERIC)
    expect(toUserMessage(null)).toBe(ERR.GENERIC)
    expect(toUserMessage(42)).toBe(ERR.GENERIC)
  })
})

describe('toUserMessage — already-friendly messages pass through', () => {
  it.each([ERR.NETWORK, ERR.RATE_LIMITED, ERR.INVALID_CREDENTIALS])(
    'passes through already-safe message: %s',
    (msg) => {
      expect(toUserMessage(new Error(msg))).toBe(msg)
    }
  )
})
