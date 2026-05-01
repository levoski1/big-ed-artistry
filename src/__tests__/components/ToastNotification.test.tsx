import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ToastNotification from '@/components/ui/ToastNotification'

describe('ToastNotification', () => {
  const onDismiss = jest.fn()

  beforeEach(() => onDismiss.mockClear())

  it('renders with data-testid="toast-notification"', () => {
    render(<ToastNotification message="Item added!" onDismiss={onDismiss} />)
    expect(screen.getByTestId('toast-notification')).toBeInTheDocument()
  })

  it('has role="status" for accessibility', () => {
    render(<ToastNotification message="Item added!" onDismiss={onDismiss} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays the message text', () => {
    render(<ToastNotification message="Portrait Print added to cart!" onDismiss={onDismiss} />)
    expect(screen.getByText('Portrait Print added to cart!')).toBeInTheDocument()
  })

  it('renders a dismiss button with aria-label', () => {
    render(<ToastNotification message="Test" onDismiss={onDismiss} />)
    expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<ToastNotification message="Test" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('defaults to success variant without throwing', () => {
    render(<ToastNotification message="Success!" onDismiss={onDismiss} />)
    expect(screen.getByTestId('toast-notification')).toBeInTheDocument()
  })

  it('renders error variant without throwing', () => {
    render(<ToastNotification message="Something went wrong" variant="error" onDismiss={onDismiss} />)
    expect(screen.getByTestId('toast-notification')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders info variant without throwing', () => {
    render(<ToastNotification message="FYI" variant="info" onDismiss={onDismiss} />)
    expect(screen.getByTestId('toast-notification')).toBeInTheDocument()
  })

  it('is fixed-position', () => {
    render(<ToastNotification message="Test" onDismiss={onDismiss} />)
    expect(screen.getByTestId('toast-notification').style.position).toBe('fixed')
  })

  it('has a high z-index', () => {
    render(<ToastNotification message="Test" onDismiss={onDismiss} />)
    expect(Number(screen.getByTestId('toast-notification').style.zIndex)).toBeGreaterThanOrEqual(9000)
  })
})
