/**
 * @jest-environment node
 *
 * Tests for the /auth/confirm route handler (email verification).
 * Covers PKCE code flow, token_hash flow, and all error states.
 */

import { GET } from '@/app/auth/confirm/route'
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
  it('exchanges valid code and redirects to /login?confirmed=1', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/confirm?code=valid-code-123')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?confirmed=1')
    expect(mockExchangeCode).toHaveBeenCalledWith('valid-code-123')
  })

  it('redirects to invalid_token when code exchange fails', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'Invalid code' } })
    const req = makeRequest('http://localhost:3000/auth/confirm?code=bad-code')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?error=invalid_token')
  })

  it('does not fall through to token_hash when code is present but invalid', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'bad' } })
    mockVerifyOtp.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/confirm?code=bad-code&token_hash=abc&type=signup')
    const response = await GET(req as any)
    expect(location(response)).toBe('http://localhost:3000/login?error=invalid_token')
    expect(mockVerifyOtp).not.toHaveBeenCalled()
  })
})

// ─── token_hash flow ──────────────────────────────────────────────────────

describe('token_hash flow (legacy / SITE_URL)', () => {
  it('verifies valid token and redirects to /login?confirmed=1', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=valid-token&type=signup')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?confirmed=1')
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: 'signup',
      token_hash: 'valid-token',
    })
  })

  it('redirects to link_expired when token is expired (otp_expired code)', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { code: 'otp_expired', message: 'Token has expired.' } })
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=expired-token&type=signup')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?error=link_expired')
  })

  it('redirects to link_expired when message contains "expired"', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { code: 'otp', message: 'Token has expired or been used.' } })
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=used-token&type=signup')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?error=link_expired')
  })

  it('redirects to verification_failed for non-expired errors (consumed token)', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { code: 'otp', message: 'Token was already used.' } })
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=consumed-token&type=signup')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?error=verification_failed')
  })

  it('redirects to verification_failed for generic otp error without "expired"', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { code: 'otp', message: 'Invalid token hash.' } })
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=bad-token&type=signup')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?error=verification_failed')
  })

  it('works with magiclink type for resend flow', async () => {
    mockVerifyOtp.mockResolvedValue({ error: null })
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=magic-token&type=magiclink')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?confirmed=1')
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: 'magiclink',
      token_hash: 'magic-token',
    })
  })
})

// ─── No params / fallback ─────────────────────────────────────────────────

describe('fallback (no valid params)', () => {
  it('redirects to invalid_token when no params provided', async () => {
    const req = makeRequest('http://localhost:3000/auth/confirm')
    const response = await GET(req as any)
    expect(response.status).toBe(307)
    expect(location(response)).toBe('http://localhost:3000/login?error=invalid_token')
  })

  it('redirects to invalid_token for unrecognised params', async () => {
    const req = makeRequest('http://localhost:3000/auth/confirm?foo=bar&baz=qux')
    const response = await GET(req as any)
    expect(location(response)).toBe('http://localhost:3000/login?error=invalid_token')
  })

  it('redirects to invalid_token when type is present without token_hash', async () => {
    const req = makeRequest('http://localhost:3000/auth/confirm?type=signup')
    const response = await GET(req as any)
    expect(location(response)).toBe('http://localhost:3000/login?error=invalid_token')
  })

  it('redirects to invalid_token when token_hash is present without type', async () => {
    const req = makeRequest('http://localhost:3000/auth/confirm?token_hash=abc')
    const response = await GET(req as any)
    expect(location(response)).toBe('http://localhost:3000/login?error=invalid_token')
  })
})
