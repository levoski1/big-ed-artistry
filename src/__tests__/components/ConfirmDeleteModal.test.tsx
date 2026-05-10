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

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = jest.fn()
    render(<ConfirmDeleteModal {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('confirm-delete-confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
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
})
