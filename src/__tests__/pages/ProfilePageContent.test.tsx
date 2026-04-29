import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfilePageContent from '@/app/dashboard/profile/ProfilePageContent'
import type { Database } from '@/lib/types/database'

jest.mock('@/components/ui', () => ({
  FormGroup: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><label>{label}</label>{children}</div>
  ),
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))
jest.mock('@/app/actions/auth', () => ({
  updateProfile: jest.fn().mockResolvedValue({}),
  logout: jest.fn(),
}))
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}))
jest.mock('@/lib/tokens', () => ({
  formatDate: (s: string) => s,
}))

type Profile = Database['public']['Tables']['profiles']['Row']

const mockUser: Profile = {
  id: 'u1', full_name: 'Jane Doe', email: 'jane@test.com',
  phone: '+234 800 000 0000', role: 'customer',
  created_at: '2024-01-01', updated_at: '2024-01-01',
}

describe('ProfilePageContent', () => {
  it('renders user name and email', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={3} completedCount={1} />)
    expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0)
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
  })

  it('shows initials avatar', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={3} completedCount={1} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows account summary stats', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={3} completedCount={1} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders profile form by default', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={0} completedCount={0} />)
    expect(screen.getByText('Profile Details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('switches to password tab', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={0} completedCount={0} />)
    fireEvent.click(screen.getByRole('button', { name: /change password/i }))
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter current password/i)).toBeInTheDocument()
  })

  it('shows password mismatch error', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={0} completedCount={0} />)
    fireEvent.click(screen.getByRole('button', { name: /change password/i }))
    fireEvent.change(screen.getByPlaceholderText(/enter current password/i), { target: { value: 'oldpass' } })
    fireEvent.change(screen.getByPlaceholderText(/min. 8 characters/i), { target: { value: 'newpass1' } })
    fireEvent.change(screen.getByPlaceholderText(/repeat new password/i), { target: { value: 'different' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('shows short password error', () => {
    render(<ProfilePageContent user={mockUser} totalOrders={0} completedCount={0} />)
    fireEvent.click(screen.getByRole('button', { name: /change password/i }))
    fireEvent.change(screen.getByPlaceholderText(/enter current password/i), { target: { value: 'old' } })
    fireEvent.change(screen.getByPlaceholderText(/min. 8 characters/i), { target: { value: 'short' } })
    fireEvent.change(screen.getByPlaceholderText(/repeat new password/i), { target: { value: 'short' } })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
  })

  it('handles null user gracefully', () => {
    render(<ProfilePageContent user={null} totalOrders={0} completedCount={0} />)
    expect(screen.getByText('U')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
  })
})
