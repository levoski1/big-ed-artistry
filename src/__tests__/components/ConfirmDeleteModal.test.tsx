import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'

describe('ConfirmDeleteModal', () => {
  const defaultProps = {
    title: 'Delete User',
    message: 'This action cannot be undone.',
    detailLines: [
      { label: 'Name', value: 'Jane Doe' },
      { label: 'Email', value: 'jane@test.com' },
    ],
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and message', () => {
    render(<ConfirmDeleteModal {...defaultProps} />)
    expect(screen.getByText('Delete User')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('renders detail lines', () => {
    render(<ConfirmDeleteModal {...defaultProps} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons', () => {
    render(<ConfirmDeleteModal {...defaultProps} />)
    expect(screen.getByTestId('confirm-delete-confirm')).toHaveTextContent('Delete')
    expect(screen.getByTestId('confirm-delete-cancel')).toHaveTextContent('Cancel')
  })

  it('calls onConfirm with user_only by default', () => {
    const onConfirm = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(onConfirm).toHaveBeenCalledWith('user_only')
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('confirm-delete-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when backdrop clicked', () => {
    const onCancel = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('confirm-delete-backdrop'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('shows loading state on confirm button', () => {
    render(<ConfirmDeleteModal {...defaultProps} loading={true} />)
    expect(screen.getByTestId('confirm-delete-confirm')).toHaveTextContent('Deleting…')
    expect(screen.getByTestId('confirm-delete-confirm')).toBeDisabled()
    expect(screen.getByTestId('confirm-delete-cancel')).toBeDisabled()
  })

  it('shows error message when provided', () => {
    render(<ConfirmDeleteModal {...defaultProps} error="Failed to delete." />)
    expect(screen.getByTestId('confirm-delete-error')).toHaveTextContent('Failed to delete.')
  })

  it('disables backdrop click when loading', () => {
    const onCancel = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} loading={true} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('confirm-delete-backdrop'))
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('renders custom confirm label', () => {
    render(<ConfirmDeleteModal {...defaultProps} confirmLabel="Remove User" />)
    expect(screen.getByTestId('confirm-delete-confirm')).toHaveTextContent('Remove User')
  })

  it('renders custom cancel label', () => {
    render(<ConfirmDeleteModal {...defaultProps} cancelLabel="Go Back" />)
    expect(screen.getByTestId('confirm-delete-cancel')).toHaveTextContent('Go Back')
  })

  it('sets role="alertdialog" and aria-modal="true"', () => {
    render(<ConfirmDeleteModal {...defaultProps} />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Delete User')
  })

  // ── Deletion type selection ────────────────────────────────

  it('does not show deletion type options when showDeletionType is false', () => {
    render(<ConfirmDeleteModal {...defaultProps} />)
    expect(screen.queryByTestId('deletion-type-user_only')).not.toBeInTheDocument()
  })

  it('shows deletion type options when showDeletionType is true', () => {
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType />)
    expect(screen.getByTestId('deletion-type-user_only')).toBeInTheDocument()
    expect(screen.getByTestId('deletion-type-full')).toBeInTheDocument()
  })

  it('renders both deletion option labels and descriptions', () => {
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType />)
    expect(screen.getByText('Delete User Only')).toBeInTheDocument()
    expect(screen.getByText('Delete User + All Activities')).toBeInTheDocument()
    expect(screen.getByText(/Removes the user account\. Keeps all orders/i)).toBeInTheDocument()
    expect(screen.getByText(/Permanently removes the user account and all associated data/i)).toBeInTheDocument()
  })

  it('defaults to user_only selection', () => {
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType />)
    const radio = screen.getByDisplayValue('user_only') as HTMLInputElement
    expect(radio.checked).toBe(true)
  })

  it('switches to full when that option is selected', () => {
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType />)
    fireEvent.click(screen.getByDisplayValue('full'))
    const fullRadio = screen.getByDisplayValue('full') as HTMLInputElement
    expect(fullRadio.checked).toBe(true)
    const userRadio = screen.getByDisplayValue('user_only') as HTMLInputElement
    expect(userRadio.checked).toBe(false)
  })

  it('passes user_only to onConfirm when confirm clicked with default selection', () => {
    const onConfirm = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(onConfirm).toHaveBeenCalledWith('user_only')
  })

  it('passes full to onConfirm when confirm clicked after switching to full', () => {
    const onConfirm = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType onConfirm={onConfirm} />)
    fireEvent.click(screen.getByDisplayValue('full'))
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(onConfirm).toHaveBeenCalledWith('full')
  })

  it('disables radio inputs when loading', () => {
    render(<ConfirmDeleteModal {...defaultProps} showDeletionType loading={true} />)
    const radios = screen.getAllByRole('radio')
    radios.forEach(r => expect(r).toBeDisabled())
  })
})
