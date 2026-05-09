import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NotificationPreferencesForm from '@/components/ui/NotificationPreferencesForm'
import type { NotificationPreferences } from '@/lib/notificationPreferences'

const ALL_ON: NotificationPreferences = {
  order_confirmation: true,
  payment_confirmation: true,
  payment_reminder: true,
  order_status_update: true,
  welcome: true,
}

describe('NotificationPreferencesForm', () => {
  it('renders all preference toggles', () => {
    render(<NotificationPreferencesForm initial={ALL_ON} onSave={jest.fn()} />)
    expect(screen.getByLabelText(/toggle order confirmation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/toggle payment confirmation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/toggle payment reminders/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/toggle order status updates/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/toggle welcome email/i)).toBeInTheDocument()
  })

  it('reflects initial on/off state via aria-checked', () => {
    const initial: NotificationPreferences = { ...ALL_ON, payment_reminder: false }
    render(<NotificationPreferencesForm initial={initial} onSave={jest.fn()} />)
    expect(screen.getByLabelText(/toggle payment reminders/i)).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByLabelText(/toggle order confirmation/i)).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles a preference when clicked', () => {
    render(<NotificationPreferencesForm initial={ALL_ON} onSave={jest.fn()} />)
    const toggle = screen.getByLabelText(/toggle payment reminders/i)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onSave with current preferences on submit', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true })
    render(<NotificationPreferencesForm initial={ALL_ON} onSave={onSave} />)

    // Opt out of payment_reminder
    fireEvent.click(screen.getByLabelText(/toggle payment reminders/i))
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1))
    expect(onSave).toHaveBeenCalledWith({ ...ALL_ON, payment_reminder: false })
  })

  it('shows success message after save', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true })
    render(<NotificationPreferencesForm initial={ALL_ON} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))
    await waitFor(() => expect(screen.getByText(/preferences saved/i)).toBeInTheDocument())
  })

  it('shows error message when save fails', async () => {
    const onSave = jest.fn().mockResolvedValue({ error: 'Network error' })
    render(<NotificationPreferencesForm initial={ALL_ON} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument())
  })

  it('disables save button while saving', async () => {
    let resolve!: (v: { success: true }) => void
    const onSave = jest.fn().mockReturnValue(new Promise<{ success: true }>(r => { resolve = r }))
    render(<NotificationPreferencesForm initial={ALL_ON} onSave={onSave} />)
    const btn = screen.getByRole('button', { name: /save preferences/i })
    fireEvent.click(btn)
    expect(btn).toBeDisabled()
    resolve({ success: true })
    await waitFor(() => expect(btn).not.toBeDisabled())
  })

  it('opted-out preference is passed correctly (acceptance: opted-out user does not receive email)', async () => {
    // This test verifies the UI correctly passes opted-out prefs to the save handler,
    // which the email service then uses to skip sending.
    const onSave = jest.fn().mockResolvedValue({ success: true })
    const initial: NotificationPreferences = { ...ALL_ON, order_status_update: false }
    render(<NotificationPreferencesForm initial={initial} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ order_status_update: false })
    ))
  })

  it('re-enabled preference is passed correctly (acceptance: email resumes after re-enable)', async () => {
    const onSave = jest.fn().mockResolvedValue({ success: true })
    const initial: NotificationPreferences = { ...ALL_ON, order_status_update: false }
    render(<NotificationPreferencesForm initial={initial} onSave={onSave} />)

    // Re-enable
    fireEvent.click(screen.getByLabelText(/toggle order status updates/i))
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ order_status_update: true })
    ))
  })
})
