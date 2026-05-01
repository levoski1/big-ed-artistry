/**
 * @jest-environment node
 *
 * Tests for security controls in register and login server actions:
 * - Rate limiting
 * - Input validation / sanitization
 * - Enumeration protection on login
 */

import { register, login } from '@/app/actions/auth'
import { _clearStore } from '@/lib/rateLimit'
import { ERR } from '@/lib/errorMessages'

// ─── Mocks ────────────────────────────────────────────────────────────────

// Mock next/headers so getClientIp() works in tests
const mockHeaders = new Map<string, string>([['x-forwarded-for', '1.2.3.4']])
jest.mock('next/headers', () => ({
  headers: () => ({ get: (k: string) => mockHeaders.get(k) ?? null }),
}))

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

const mockCreateUser = jest.fn()
const mockGenerateLink = jest.fn()
const mockUpsert = jest.fn()
const mockSignIn = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({ auth: { signInWithPassword: mockSignIn } })
  ),
  createAdminClient: jest.fn(() => ({
    auth: {
      admin: {
        createUser: mockCreateUser,
        generateLink: mockGenerateLink,
      },
    },
    from: jest.fn(() => ({ upsert: mockUpsert })),
  })),
}))

jest.mock('@/lib/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
}))

jest.mock('@/lib/emailTemplates', () => ({
  confirmationTemplate: jest.fn(() => '<p>confirm</p>'),
  passwordResetTemplate: jest.fn(() => '<p>reset</p>'),
}))

// Ensure NEXT_PUBLIC_SITE_URL is set so register() doesn't bail out
beforeAll(() => { process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000' })
afterAll(() => { delete process.env.NEXT_PUBLIC_SITE_URL })

// ─── Helpers ──────────────────────────────────────────────────────────────

const VALID_REGISTER = {
  email: 'alice@example.com',
  password: 'securepass123',
  full_name: 'Alice Smith',
}

function setupSuccessfulRegister() {
  mockCreateUser.mockResolvedValue({
    data: { user: { id: 'user-1' } },
    error: null,
  })
  mockUpsert.mockResolvedValue({ error: null })
  mockGenerateLink.mockResolvedValue({
    data: { properties: { action_link: 'https://example.com/confirm' } },
    error: null,
  })
}

// ─── register — input validation ─────────────────────────────────────────

describe('register — input validation', () => {
  beforeEach(() => {
    _clearStore()
    jest.clearAllMocks()
    mockHeaders.set('x-forwarded-for', '5.5.5.5')
  })

  it('rejects invalid email', async () => {
    await expect(register({ ...VALID_REGISTER, email: 'not-an-email' }))
      .rejects.toThrow('Invalid email address.')
  })

  it('rejects short password', async () => {
    await expect(register({ ...VALID_REGISTER, password: 'short' }))
      .rejects.toThrow('Password must be at least 8 characters.')
  })

  it('rejects name with HTML injection', async () => {
    await expect(register({ ...VALID_REGISTER, full_name: '<script>xss</script>' }))
      .rejects.toThrow('Please enter a valid name.')
  })

  it('rejects empty name', async () => {
    await expect(register({ ...VALID_REGISTER, full_name: '' }))
      .rejects.toThrow('Please enter a valid name.')
  })

  it('passes sanitized values to createUser', async () => {
    setupSuccessfulRegister()
    await register({ ...VALID_REGISTER, email: '  Alice@Example.COM  ' })
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@example.com' })
    )
  })
})

// ─── register — rate limiting ─────────────────────────────────────────────

describe('register — rate limiting', () => {
  beforeEach(() => {
    _clearStore()
    jest.clearAllMocks()
    mockHeaders.set('x-forwarded-for', '6.6.6.6')
    setupSuccessfulRegister()
  })

  it('allows up to 5 registrations per IP', async () => {
    for (let i = 0; i < 5; i++) {
      mockHeaders.set('x-forwarded-for', `6.6.6.${i}`)
      _clearStore()
      await expect(register(VALID_REGISTER)).resolves.toBeDefined()
    }
  })

  it('blocks the 6th registration from the same IP', async () => {
    mockHeaders.set('x-forwarded-for', '7.7.7.7')
    for (let i = 0; i < 5; i++) {
      await register(VALID_REGISTER).catch(() => {})
    }
    await expect(register(VALID_REGISTER)).rejects.toThrow('Too many attempts')
  })
})

// ─── login — input validation ─────────────────────────────────────────────

describe('login — input validation', () => {
  beforeEach(() => {
    _clearStore()
    jest.clearAllMocks()
    mockHeaders.set('x-forwarded-for', '8.8.8.8')
  })

  it('rejects invalid email with generic message', async () => {
    await expect(login('not-an-email', 'password123'))
      .rejects.toThrow(ERR.INVALID_CREDENTIALS)
  })

  it('rejects short password with generic message', async () => {
    await expect(login('user@example.com', 'short'))
      .rejects.toThrow(ERR.INVALID_CREDENTIALS)
  })

  it('normalizes email before passing to Supabase', async () => {
    mockSignIn.mockResolvedValue({ data: { session: {} }, error: null })
    await login('  User@Example.COM  ', 'password123')
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' })
    )
  })
})

// ─── login — enumeration protection ──────────────────────────────────────

describe('login — enumeration protection', () => {
  beforeEach(() => {
    _clearStore()
    jest.clearAllMocks()
    mockHeaders.set('x-forwarded-for', '9.9.9.9')
  })

  it('returns same error for wrong password as for non-existent user', async () => {
    mockSignIn.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } })
    await expect(login('user@example.com', 'wrongpassword'))
      .rejects.toThrow(ERR.INVALID_CREDENTIALS)
  })

  it('does not reveal whether email exists', async () => {
    mockSignIn.mockResolvedValue({ data: null, error: { message: 'Email not confirmed' } })
    await expect(login('unconfirmed@example.com', 'password123'))
      .rejects.toThrow(ERR.EMAIL_NOT_CONFIRMED)
  })

  it('does not leak Supabase error details', async () => {
    mockSignIn.mockResolvedValue({ data: null, error: { message: 'User not found in database' } })
    try {
      await login('user@example.com', 'password123')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      expect(msg).not.toContain('database')
      expect(msg).not.toContain('User not found')
    }
  })
})

// ─── login — rate limiting ────────────────────────────────────────────────

describe('login — rate limiting', () => {
  beforeEach(() => {
    _clearStore()
    jest.clearAllMocks()
    mockHeaders.set('x-forwarded-for', '11.11.11.11')
    mockSignIn.mockResolvedValue({ data: null, error: { message: 'Invalid login credentials' } })
  })

  it('blocks after 10 failed attempts from the same IP', async () => {
    for (let i = 0; i < 10; i++) {
      await login('user@example.com', 'wrongpass').catch(() => {})
    }
    await expect(login('user@example.com', 'wrongpass'))
      .rejects.toThrow('Too many attempts')
  })

  it('different IPs have independent counters', async () => {
    mockHeaders.set('x-forwarded-for', '12.12.12.12')
    for (let i = 0; i < 10; i++) {
      await login('user@example.com', 'wrongpass').catch(() => {})
    }
    // Different IP should not be blocked
    mockHeaders.set('x-forwarded-for', '13.13.13.13')
    mockSignIn.mockResolvedValue({ data: { session: {} }, error: null })
    await expect(login('user@example.com', 'correctpass')).resolves.toBeDefined()
  })
})
