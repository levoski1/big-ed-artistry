/**
 * @jest-environment node
 *
 * Tests for the /auth/reset route handler (password reset redirect).
 * Covers PKCE code flow, token_hash legacy flow, and error handling.
 */

import { GET } from '@/app/auth/reset/route'
import { resetAppUrlCache } from '@/lib/appUrl'

// ─── Mocks ────────────────────────────────────────────────────────────────

const mockExchangeCode = jest.fn()
const mockVerifyOtp = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCode,
      verifyOtp: mockVerifyOtp,
    },
  })),
}))

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(url: string): Request {
  return new Request(url)
}

function location(resp: Response): string {
  return resp.headers.get('location') ?? ''
}

// ─── Setup ────────────────────────────────────────────────────────────────

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  resetAppUrlCache()
})

afterAll(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_URL
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  resetAppUrlCache()
})

beforeEach(() => {
  mockExchangeCode.mockReset()
  mockVerifyOtp.mockReset()
})

// ─── PKCE code flow ───────────────────────────────────────────────────────

describe('PKCE code flow', () => {
  it('exchanges valid code for session and redirects to /reset-password', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/reset?code=valid-code-123')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/reset-password')
    expect(mockExchangeCode).toHaveBeenCalledWith('valid-code-123')
  })

  it('redirects to /forgot-password?error=1 when code is expired', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'Code expired', code: 'otp_expired' } })
    const req = makeRequest('http://localhost:3000/auth/reset?code=expired-code')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })

  it('redirects to /forgot-password?error=1 when code is invalid', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'Invalid code' } })
    const req = makeRequest('http://localhost:3000/auth/reset?code=bad-code')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })

  it('does NOT fall through to token_hash when code is invalid', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'bad' } })
    mockVerifyOtp.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/reset?code=bad-code&token_hash=abc&type=recovery')
    const response = await GET(req as any)
    // Should return the code error, not fall through to token_hash
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
    expect(mockVerifyOtp).not.toHaveBeenCalled()
  })
})

// ─── token_hash flow (legacy) ─────────────────────────────────────────────

describe('token_hash flow (legacy)', () => {
  it('verifies valid token and redirects to /reset-password', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/reset?token_hash=valid-token&type=recovery')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/reset-password')
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: 'recovery',
      token_hash: 'valid-token',
    })
  })

  it('redirects to /forgot-password?error=1 when token is expired', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { message: 'Token expired', code: 'otp_expired' } })
    const req = makeRequest('http://localhost:3000/auth/reset?token_hash=expired-token&type=recovery')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })

  it('redirects to /forgot-password?error=1 when token is invalid', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { message: 'Invalid token' } })
    const req = makeRequest('http://localhost:3000/auth/reset?token_hash=bad-token&type=recovery')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })

  it('ignores token_hash when type is not recovery', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/reset?token_hash=some-token&type=signup')
    const response = await GET(req as any)
    // type !== 'recovery' so it falls through to error
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
    expect(mockVerifyOtp).not.toHaveBeenCalled()
  })
})

// ─── No params / fallback ─────────────────────────────────────────────────

describe('fallback (no valid params)', () => {
  it('redirects to /forgot-password?error=1 when no params provided', async () => {
    const req = makeRequest('http://localhost:3000/auth/reset')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })

  it('redirects to /forgot-password?error=1 for unrecognised params', async () => {
    const req = makeRequest('http://localhost:3000/auth/reset?foo=bar&baz=qux')
    const response = await GET(req as any)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })

  it('redirects to /forgot-password?error=1 when only type=recovery without token_hash', async () => {
    const req = makeRequest('http://localhost:3000/auth/reset?type=recovery')
    const response = await GET(req as any)
    expect(location(response)).toBe('http://localhost:3000/forgot-password?error=1')
  })
})
