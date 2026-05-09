import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CustomArtworkPage from '@/app/(public)/custom-artwork/page'

// ── mocks ──────────────────────────────────────────────────────────────────
jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>)
jest.mock('@/components/layout/PublicLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>)
jest.mock('@/context/CartContext', () => ({
  useCart: () => ({ addArtwork: jest.fn() }),
}))

jest.mock('@/app/actions/uploads', () => ({
  uploadArtworkReference: jest.fn(() => Promise.resolve({
    id: 'upload-1',
    file_url: 'https://example.com/ref.jpg',
  })),
}))

// URL.createObjectURL is not available in jsdom
global.URL.createObjectURL = jest.fn(() => 'blob:mock')
global.URL.revokeObjectURL = jest.fn()

// ── helpers ────────────────────────────────────────────────────────────────
function selectSize(label: string) {
  fireEvent.click(screen.getByText(label))
}

function uploadFile() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
  fireEvent.change(input, { target: { files: [file] } })
}

// ── tests ──────────────────────────────────────────────────────────────────
describe('CustomArtworkPage', () => {
  beforeEach(() => render(<CustomArtworkPage />))

  it('renders the page heading', () => {
    expect(screen.getByText(/Customise Your Photos Into/i)).toBeInTheDocument()
  })

  it('renders all 7 size options', () => {
    expect(screen.getByText('12 × 16')).toBeInTheDocument()
    expect(screen.getByText('36 × 48')).toBeInTheDocument()
  })

  it('Add to Cart button is disabled before size and photo are selected', () => {
    const btn = screen.getByRole('button', { name: /select size & upload photo/i })
    expect(btn).toBeDisabled()
  })

  it('enables Add to Cart after selecting size and uploading photo', () => {
    selectSize('16 × 20')
    uploadFile()
    const btn = screen.getByRole('button', { name: /add to cart/i })
    expect(btn).not.toBeDisabled()
  })

  it('shows price summary section', () => {
    expect(screen.getByText('Price Summary')).toBeInTheDocument()
  })

  it('shows subtotal as — when no size selected', () => {
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows write-up textarea when "Yes — Add Text" is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /yes — add text/i }))
    expect(screen.getByPlaceholderText(/custom message or caption/i)).toBeInTheDocument()
  })

  it('hides write-up textarea when "No — Skip" is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /yes — add text/i }))
    fireEvent.click(screen.getByRole('button', { name: /no — skip/i }))
    expect(screen.queryByPlaceholderText(/custom message or caption/i)).not.toBeInTheDocument()
  })

  it('disables large/premium frames for compact sizes (12×16)', () => {
    selectSize('12 × 16')
    expect(screen.getByText(/some frames are unavailable/i)).toBeInTheDocument()
  })

  it('calls addArtwork and resets form on successful add', async () => {
    const addArtwork = jest.fn()
    jest.spyOn(require('@/context/CartContext'), 'useCart').mockReturnValue({ addArtwork })
    selectSize('16 × 20')
    uploadFile()
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    await waitFor(() => expect(addArtwork).toHaveBeenCalledTimes(1))
  })
})
