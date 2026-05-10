/**
 * Tests for the /reset-password page.
 * Covers session detection, password reset flow, error states, and success.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ResetPasswordPage from '@/app/(public)/reset-password/page'
import { ERR } from '@/lib/errorMessages'

// ─── Mocks ────────────────────────────────────────────────────────────────

const mockRouterPush = jest.fn()
let mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  useSearchParams: () => mockSearchParams,
}))

const mockGetSession = jest.fn()
const mockGetUser = jest.fn()
let authStateCallback: ((event: string, session: unknown) => void) | null = null

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      onAuthStateChange: (cb: (event: string, session: unknown) => void) => {
        authStateCallback = cb
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      },
      signOut: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn(),
    },
  })),
}))

const mockResetPassword = jest.fn()
jest.mock('@/app/actions/auth', () => ({
  resetPassword: (...args: unknown[]) => mockResetPassword(...args),
}))

jest.mock('@/components/ui', () => ({
  FormGroup: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label>{label}</label>
      {children}
    </div>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  GoldLine: () => <hr />,
}))

function advanceTimers(ms: number) {
  act(() => { jest.advanceTimersByTime(ms) })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSearchParams = new URLSearchParams()
  authStateCallback = null
  mockGetSession.mockReset()
  mockGetUser.mockReset()
  mockResetPassword.mockReset()
  mockRouterPush.mockClear()
})

// ─── Loading state ────────────────────────────────────────────────────────

describe('loading state', () => {
  it('shows "Verifying link…" while session is being checked', () => {
    mockGetSession.mockReturnValue(new Promise(() => {}))
    render(<ResetPasswordPage />)
    expect(screen.getByText('Verifying link…')).toBeInTheDocument()
  })
})

// ─── Session ready (valid token) ──────────────────────────────────────────

describe('session ready', () => {
  it('shows password heading when getSession returns a session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
    render(<ResetPasswordPage />)
    expect(await screen.findByRole('heading', { name: /new password/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument()
  })

  it('shows password form on PASSWORD_RECOVERY event', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<ResetPasswordPage />)
    expect(screen.getByText('Verifying link…')).toBeInTheDocument()
    act(() => { authStateCallback?.('PASSWORD_RECOVERY', { user: { id: 'u1' } }) })
    expect(await screen.findByRole('heading', { name: /new password/i })).toBeInTheDocument()
  })

  it('shows password form on SIGNED_IN event with session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<ResetPasswordPage />)
    act(() => { authStateCallback?.('SIGNED_IN', { user: { id: 'u1' } }) })
    expect(await screen.findByRole('heading', { name: /new password/i })).toBeInTheDocument()
  })

  it('shows password form via getUser() fallback after delay', async () => {
    jest.useFakeTimers()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    render(<ResetPasswordPage />)
    expect(screen.getByText('Verifying link…')).toBeInTheDocument()
    advanceTimers(2000)
    await act(async () => { await Promise.resolve() })
    expect(await screen.findByRole('heading', { name: /new password/i })).toBeInTheDocument()
    expect(mockGetUser).toHaveBeenCalled()
    jest.useRealTimers()
  })
})

// ─── Invalid/expired token ────────────────────────────────────────────────

describe('invalid/expired token', () => {
  it('shows expired state when getSession and getUser return null', async () => {
    jest.useFakeTimers()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockGetUser.mockResolvedValue({ data: { user: null } })
    render(<ResetPasswordPage />)
    advanceTimers(2000)
    await act(async () => { await Promise.resolve() })
    expect(screen.getByTestId('token-invalid-message')).toHaveTextContent(ERR.RESET_TOKEN_INVALID)
    jest.useRealTimers()
  })

  it('shows expired state immediately when URL has error=1', () => {
    mockSearchParams = new URLSearchParams('error=1')
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<ResetPasswordPage />)
    expect(screen.getByTestId('token-invalid-message')).toHaveTextContent(ERR.RESET_TOKEN_INVALID)
  })

  it('shows "Request New Link" button in expired state', async () => {
    jest.useFakeTimers()
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockGetUser.mockResolvedValue({ data: { user: null } })
    render(<ResetPasswordPage />)
    advanceTimers(2000)
    await act(async () => { await Promise.resolve() })
    expect(screen.getByText('Request New Link →')).toBeInTheDocument()
    expect(screen.getByText('← Back to Login')).toBeInTheDocument()
    jest.useRealTimers()
  })

  it('shows SIGNED_OUT event sets session to false', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<ResetPasswordPage />)
    act(() => { authStateCallback?.('SIGNED_OUT', null) })
    expect(await screen.findByTestId('token-invalid-message')).toBeInTheDocument()
  })
})

// ─── Password reset form ──────────────────────────────────────────────────

describe('password reset form', () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } } })
  })

  async function waitForForm() {
    expect(await screen.findByPlaceholderText('At least 8 characters')).toBeInTheDocument()
  }

  function fillPasswords(password: string, confirm: string) {
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: password } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your new password'), { target: { value: confirm } })
  }

  function clickSubmit() {
    fireEvent.click(screen.getByRole('button', { name: /set new password/i }))
  }

  it('shows error when submitting empty fields', async () => {
    render(<ResetPasswordPage />)
    await waitForForm()
    clickSubmit()
    expect(screen.getByText('Please fill in both fields.')).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'different1')
    clickSubmit()
    expect(screen.getByText(ERR.PASSWORDS_MISMATCH)).toBeInTheDocument()
  })

  it('shows error when password is too short', async () => {
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('short', 'short')
    clickSubmit()
    expect(screen.getByText(ERR.WEAK_PASSWORD)).toBeInTheDocument()
  })

  it('calls resetPassword with the entered passwords', async () => {
    mockResetPassword.mockResolvedValue({ success: true })
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'newpass123')
    clickSubmit()
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('newpass123', 'newpass123')
    })
  })

  it('shows success message after password reset', async () => {
    mockResetPassword.mockResolvedValue({ success: true })
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'newpass123')
    clickSubmit()
    expect(await screen.findByTestId('reset-success-message')).toBeInTheDocument()
    expect(screen.getByText(/Your password has been successfully reset/)).toBeInTheDocument()
  })

  it('shows error message when resetPassword fails', async () => {
    mockResetPassword.mockResolvedValue({ error: 'Failed to reset password.' })
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'newpass123')
    clickSubmit()
    expect(await screen.findByText('Failed to reset password.')).toBeInTheDocument()
  })

  it('disables submit button while loading', async () => {
    mockResetPassword.mockReturnValue(new Promise(() => {}))
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'newpass123')
    clickSubmit()
    expect(await screen.findByText('Saving…')).toBeInTheDocument()
    expect(screen.getByText('Saving…')).toBeDisabled()
  })

  it('shows Go to Login button after success', async () => {
    mockResetPassword.mockResolvedValue({ success: true })
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'newpass123')
    clickSubmit()
    expect(await screen.findByText('Go to Login →')).toBeInTheDocument()
  })

  it('navigates to login when Go to Login is clicked', async () => {
    mockResetPassword.mockResolvedValue({ success: true })
    render(<ResetPasswordPage />)
    await waitForForm()
    fillPasswords('newpass123', 'newpass123')
    clickSubmit()
    expect(await screen.findByText('Go to Login →')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Go to Login →'))
    expect(mockRouterPush).toHaveBeenCalledWith('/login')
  })
})

// ─── Mobile responsiveness ────────────────────────────────────────────────

describe('mobile responsiveness', () => {
  it('includes the left panel with login-panel class', () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    const { container } = render(<ResetPasswordPage />)
    expect(container.querySelector('.login-panel')).toBeInTheDocument()
  })

  it('style block contains mobile breakpoint', () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    const { container } = render(<ResetPasswordPage />)
    const styles = Array.from(container.querySelectorAll('style')).map(s => s.textContent ?? '').join('')
    expect(styles).toMatch(/max-width:\s*900px/)
    expect(styles).toMatch(/display:\s*none/)
  })
})
