import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AdminLoginPage from '@/app/admin/page'

jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))
jest.mock('@/components/ui', () => ({
  FormGroup: ({ label, children }: { label: string; children: React.ReactNode }) => <div><label>{label}</label>{children}</div>,
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  GoldLine: () => <hr />,
}))

const mockLogin = jest.fn()
const mockGetCurrentUser = jest.fn()
jest.mock('@/app/actions/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  getCurrentUser: () => mockGetCurrentUser(),
}))

describe('AdminLoginPage', () => {
  beforeEach(() => { mockLogin.mockReset(); mockGetCurrentUser.mockReset() })

  it('renders Admin Sign In heading', () => {
    render(<AdminLoginPage />)
    expect(screen.getByRole('heading', { name: /admin sign in/i })).toBeInTheDocument()
  })

  it('renders "Admin Panel" label', () => {
    render(<AdminLoginPage />)
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('shows error when fields are empty', async () => {
    render(<AdminLoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /enter admin panel/i }))
    expect(await screen.findByText('Please enter your credentials.')).toBeInTheDocument()
  })

  it('shows access denied when logged-in user is not admin', async () => {
    mockLogin.mockResolvedValue({})
    mockGetCurrentUser.mockResolvedValue({ role: 'customer' })
    render(<AdminLoginPage />)
    fireEvent.change(screen.getByPlaceholderText('admin@bigedartistry.com'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Admin password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /enter admin panel/i }))
    expect(await screen.findByText('Access denied. Admin accounts only.')).toBeInTheDocument()
  })

  it('redirects to /admin/dashboard when admin role confirmed', async () => {
    const push = jest.fn()
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push, refresh: jest.fn() })
    mockLogin.mockResolvedValue({})
    mockGetCurrentUser.mockResolvedValue({ role: 'admin' })
    render(<AdminLoginPage />)
    fireEvent.change(screen.getByPlaceholderText('admin@bigedartistry.com'), { target: { value: 'admin@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Admin password'), { target: { value: 'adminpass' } })
    fireEvent.click(screen.getByRole('button', { name: /enter admin panel/i }))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/dashboard'))
  })

  it('shows error message when login action throws', async () => {
    mockLogin.mockRejectedValue(new Error('Incorrect email or password.'))
    render(<AdminLoginPage />)
    fireEvent.change(screen.getByPlaceholderText('admin@bigedartistry.com'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('Admin password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: /enter admin panel/i }))
    expect(await screen.findByText('Incorrect email or password.')).toBeInTheDocument()
  })

  it('has a back-to-site link', () => {
    render(<AdminLoginPage />)
    expect(screen.getByRole('link', { name: /back to main site/i })).toHaveAttribute('href', '/')
  })
})
