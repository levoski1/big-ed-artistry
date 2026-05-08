import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'
import RegisterPage from '@/app/(auth)/register/page'

// ── mocks ──────────────────────────────────────────────────────────────────
jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
}))
jest.mock('@/components/ui', () => ({
  FormGroup: ({ label, children }: { label: string; children: React.ReactNode }) => <div><label>{label}</label>{children}</div>,
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  GoldLine: () => <hr />,
}))
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}))

const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockResend = jest.fn()
jest.mock('@/app/actions/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  register: (...args: unknown[]) => mockRegister(...args),
  resendConfirmation: (...args: unknown[]) => mockResend(...args),
}))

// ── Login Page ─────────────────────────────────────────────────────────────
describe('LoginPage', () => {
  beforeEach(() => { mockLogin.mockReset(); mockResend.mockReset(); render(<LoginPage />) })

  it('renders Sign In heading', () => {
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
  })

  it('shows error when submitting empty fields', async () => {
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument()
  })

  it('calls login action with email and password', async () => {
    mockLogin.mockResolvedValue({})
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'password123'))
  })

  it('shows invalid credentials error message', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid email or password. Please try again.'))
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Invalid email or password. Please try again.')).toBeInTheDocument()
  })

  it('shows unverified email banner (not error) when email is not confirmed', async () => {
    mockLogin.mockRejectedValue(new Error('Your email address has not been verified yet. Please check your inbox and click the verification link to activate your account.'))
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'unverified@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/not been verified yet/i)).toBeInTheDocument()
    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument()
  })

  it('shows resend button in unverified banner and calls resendConfirmation', async () => {
    mockLogin.mockRejectedValue(new Error('Your email address has not been verified yet. Please check your inbox and click the verification link to activate your account.'))
    mockResend.mockResolvedValue(undefined)
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'unverified@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    const resendBtn = await screen.findByRole('button', { name: /resend verification email/i })
    fireEvent.click(resendBtn)
    await waitFor(() => expect(mockResend).toHaveBeenCalledWith('unverified@test.com'))
    expect(await screen.findByText(/new verification email has been sent/i)).toBeInTheDocument()
  })

  it('has a link to the register page', () => {
    expect(screen.getByRole('link', { name: /register here/i })).toHaveAttribute('href', '/register')
  })
})

// ── Register Page ──────────────────────────────────────────────────────────
describe('RegisterPage', () => {
  beforeEach(() => { mockRegister.mockReset(); render(<RegisterPage />) })

  it('renders Create Account heading', () => {
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows error when required fields are empty', async () => {
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Please fill in all required fields.')).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password1' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'different1' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('shows error when password is too short', async () => {
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'short' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Password must be at least 8 characters.')).toBeInTheDocument()
  })

  it('shows error when terms not agreed', async () => {
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Please agree to the terms.')).toBeInTheDocument()
  })

  it('calls register action with correct data on valid submission', async () => {
    mockRegister.mockResolvedValue({})
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
      email: 'john@test.com', full_name: 'John Doe',
    })))
  })

  it('shows success confirmation screen after successful registration', async () => {
    mockRegister.mockResolvedValue({})
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'john@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('Check Your Email')).toBeInTheDocument()
    expect(await screen.findByText(/Account created successfully/i)).toBeInTheDocument()
  })

  it('shows duplicate email error message', async () => {
    mockRegister.mockRejectedValue(new Error('An account with this email already exists. Please log in instead.'))
    fireEvent.change(screen.getByPlaceholderText('First name'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('Last name'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'existing@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password123' } })
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(await screen.findByText('An account with this email already exists. Please log in instead.')).toBeInTheDocument()
  })

  it('has a link to the login page', () => {
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login')
  })
})
