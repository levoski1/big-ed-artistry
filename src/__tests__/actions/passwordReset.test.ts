/**
 * @jest-environment node
 *
 * Tests for the forgot/reset password server actions:
 * - forgotPassword: rate limiting, no enumeration, email dispatch
 * - resetPassword: password validation, mismatch, Supabase update
 */

import { forgotPassword, resetPassword } from '@/app/actions/auth'
import { _clearStore } from '@/lib/rateLimit'
import { ERR } from '@/lib/errorMessages'
import { resetAppUrlCache } from '@/lib/appUrl'

// ─── Mocks ────────────────────────────────────────────────────────────────

const mockHeaders = new Map<string, string>([['x-forwarded-for', '10.0.0.1']])
jest.mock('next/headers', () => ({
  headers: () => ({ get: (k: string) => mockHeaders.get(k) ?? null }),
}))

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))

const mockGenerateLink = jest.fn()
const mockListUsers = jest.fn()
const mockUpdateUser = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({ auth: { updateUser: mockUpdateUser } })
  ),
  createAdminClient: jest.fn(() => ({
    auth: {
      admin: {
        generateLink: mockGenerateLink,
        listUsers: mockListUsers,
      },
    },
  })),
}))

const mockSendEmail = jest.fn()
jest.mock('@/lib/emailService', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

jest.mock('@/lib/emailTemplates', () => ({
  confirmationTemplate: jest.fn(() => '<p>confirm</p>'),
  passwordResetTemplate: jest.fn(() => '<p>reset</p>'),
}))

// ─── Setup ────────────────────────────────────────────────────────────────

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
  resetAppUrlCache()
})
afterAll(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL
  resetAppUrlCache()
})

beforeEach(() => {
  _clearStore()
  mockGenerateLink.mockReset()
  mockListUsers.mockReset()
  mockUpdateUser.mockReset()
  mockSendEmail.mockReset()
  mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg-1' })
  // Default: user exists
  mockListUsers.mockResolvedValue({ data: { users: [{ email: 'alice@example.com', user_metadata: { full_name: 'Alice' } }] }, error: null })
  mockGenerateLink.mockResolvedValue({ data: { properties: { action_link: 'https://example.com/auth/reset?token_hash=abc&type=recovery' } }, error: null })
})

// ─── forgotPassword ───────────────────────────────────────────────────────

describe('forgotPassword', () => {
  it('resolves without throwing for a valid email (user exists)', async () => {
    await expect(forgotPassword('alice@example.com')).resolves.toBeUndefined()
  })

  it('sends a reset email when the user exists', async () => {
    await forgotPassword('alice@example.com')
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail.mock.calls[0][0]).toMatchObject({
      to: 'alice@example.com',
      subject: expect.stringContaining('Reset'),
    })
  })

  it('resolves without throwing for a non-existent email (no enumeration)', async () => {
    // generateLink returns an error when the email doesn't exist
    mockGenerateLink.mockResolvedValue({ data: null, error: { message: 'User not found' } })
    await expect(forgotPassword('nobody@example.com')).resolves.toBeUndefined()
  })

  it('does NOT send an email when the user does not exist', async () => {
    mockGenerateLink.mockResolvedValue({ data: null, error: { message: 'User not found' } })
    await forgotPassword('nobody@example.com')
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('resolves without throwing for an invalid email format (no enumeration)', async () => {
    await expect(forgotPassword('not-an-email')).resolves.toBeUndefined()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('throws RATE_LIMITED after 3 requests from the same IP', async () => {
    // Use a unique IP to avoid interference from other tests
    mockHeaders.set('x-forwarded-for', '10.0.0.99')
    await forgotPassword('alice@example.com')
    await forgotPassword('alice@example.com')
    await forgotPassword('alice@example.com')
    await expect(forgotPassword('alice@example.com')).rejects.toThrow(ERR.RATE_LIMITED)
    mockHeaders.set('x-forwarded-for', '10.0.0.1')
  })

  it('uses the user full_name in the reset email', async () => {
    const { passwordResetTemplate } = require('@/lib/emailTemplates')
    await forgotPassword('alice@example.com')
    expect(passwordResetTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice' })
    )
  })

  it('falls back to email as name when full_name is absent', async () => {
    mockListUsers.mockResolvedValue({ data: { users: [{ email: 'bob@example.com', user_metadata: {} }] }, error: null })
    const { passwordResetTemplate } = require('@/lib/emailTemplates')
    await forgotPassword('bob@example.com')
    expect(passwordResetTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'bob@example.com' })
    )
  })
})

// ─── resetPassword ────────────────────────────────────────────────────────

describe('resetPassword', () => {
  it('calls supabase.auth.updateUser with the new password', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    await resetPassword('newpass123', 'newpass123')
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpass123' })
  })

  it('resolves without throwing on success', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    await expect(resetPassword('newpass123', 'newpass123')).resolves.toBeUndefined()
  })

  it('throws PASSWORDS_MISMATCH when passwords do not match', async () => {
    await expect(resetPassword('newpass123', 'different1')).rejects.toThrow(ERR.PASSWORDS_MISMATCH)
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('throws WEAK_PASSWORD when password is too short', async () => {
    await expect(resetPassword('short', 'short')).rejects.toThrow(ERR.WEAK_PASSWORD)
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('throws RESET_FAILED when Supabase returns an error', async () => {
    mockUpdateUser.mockResolvedValue({ data: null, error: { message: 'Auth error' } })
    await expect(resetPassword('newpass123', 'newpass123')).rejects.toThrow(ERR.RESET_FAILED)
  })

  it('rejects passwords shorter than 8 characters', async () => {
    await expect(resetPassword('1234567', '1234567')).rejects.toThrow(ERR.WEAK_PASSWORD)
  })

  it('accepts passwords exactly 8 characters long', async () => {
    mockUpdateUser.mockResolvedValue({ data: {}, error: null })
    await expect(resetPassword('12345678', '12345678')).resolves.toBeUndefined()
  })
})
