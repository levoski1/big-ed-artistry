/**
 * @jest-environment node
 */

import { POST } from '@/app/api/email/route'
import { _clearStore } from '@/lib/rateLimit'

// ─── Mocks ────────────────────────────────────────────────────────────────

const mockSendEmail = jest.fn()
jest.mock('@/lib/emailService', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

const mockGetSession = jest.fn()
jest.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getSession: () => mockGetSession() },
  }),
}))

// ─── Helpers ──────────────────────────────────────────────────────────────

function makeRequest(body: unknown, ip = '1.2.3.4'): Request {
  return new Request('http://localhost/api/email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Hi</p>',
}

// ─── Tests ────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  _clearStore()
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
})

describe('POST /api/email — authentication', () => {
  it('returns 401 when no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    const res = await POST(makeRequest(VALID_BODY) as any)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('proceeds when session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' })
    const res = await POST(makeRequest(VALID_BODY) as any)
    expect(res.status).toBe(200)
  })
})

describe('POST /api/email — input validation', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
  })

  it('rejects missing fields', async () => {
    const res = await POST(makeRequest({ to: 'user@example.com' }) as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/invalid input/i)
  })

  it('rejects invalid email in to field', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, to: 'not-an-email' }) as any)
    expect(res.status).toBe(400)
  })

  it('rejects HTML tags in subject', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, subject: '<script>xss</script>' }) as any)
    expect(res.status).toBe(400)
  })

  it('rejects html body over 100k characters', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, html: 'a'.repeat(100_001) }) as any)
    expect(res.status).toBe(400)
  })

  it('rejects invalid JSON body', async () => {
    const req = new Request('http://localhost/api/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
      body: 'not-json',
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })

  it('does not leak internal error details', async () => {
    mockSendEmail.mockResolvedValue({ success: false, error: 'SMTP credentials invalid' })
    const res = await POST(makeRequest(VALID_BODY) as any)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).not.toContain('SMTP')
    expect(body.error).not.toContain('credentials')
  })
})

describe('POST /api/email — rate limiting', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' })
  })

  it('allows requests within the limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(VALID_BODY, '10.0.0.1') as any)
      expect(res.status).toBe(200)
    }
  })

  it('blocks requests that exceed the limit (429)', async () => {
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(VALID_BODY, '10.0.0.2') as any)
    }
    const res = await POST(makeRequest(VALID_BODY, '10.0.0.2') as any)
    expect(res.status).toBe(429)
    const body = await res.json()
    expect(body.error).toMatch(/too many requests/i)
  })

  it('includes Retry-After header on 429', async () => {
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(VALID_BODY, '10.0.0.3') as any)
    }
    const res = await POST(makeRequest(VALID_BODY, '10.0.0.3') as any)
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBeTruthy()
  })

  it('rate limits per IP — different IPs are independent', async () => {
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(VALID_BODY, '10.0.0.4') as any)
    }
    // Different IP should still be allowed
    const res = await POST(makeRequest(VALID_BODY, '10.0.0.5') as any)
    expect(res.status).toBe(200)
  })
})

describe('POST /api/email — successful send', () => {
  it('returns messageId on success', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-abc' })
    const res = await POST(makeRequest(VALID_BODY) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.messageId).toBe('msg-abc')
  })

  it('normalizes email to lowercase', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-2' })
    await POST(makeRequest({ ...VALID_BODY, to: 'User@Example.COM' }) as any)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' })
    )
  })
})
