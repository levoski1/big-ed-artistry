import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PhotoEnlargePage from '@/app/(public)/photo-enlarge/page'

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

global.URL.createObjectURL = jest.fn(() => 'blob:mock')
global.URL.revokeObjectURL = jest.fn()

function uploadPhoto() {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  const file = new File(['img'], 'portrait.jpg', { type: 'image/jpeg' })
  fireEvent.change(input, { target: { files: [file] } })
}

function selectSize(label: string) {
  fireEvent.click(screen.getByText(label))
}

describe('PhotoEnlargePage', () => {
  beforeEach(() => render(<PhotoEnlargePage />))

  it('renders the hero heading', () => {
    expect(screen.getByText(/Your Story/i)).toBeInTheDocument()
  })

  it('renders Step 01 upload section', () => {
    expect(screen.getByText('Upload Your Photo')).toBeInTheDocument()
  })

  it('Add to Cart button is disabled before photo and size are provided', () => {
    const btn = screen.getByRole('button', { name: /upload photo & select size first/i })
    expect(btn).toBeDisabled()
  })

  it('enables Add to Cart after uploading photo and selecting size', () => {
    uploadPhoto()
    selectSize('16 × 20')
    expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled()
  })

  it('shows live summary panel', () => {
    expect(screen.getByText('Live Summary')).toBeInTheDocument()
  })

  it('shows subtotal as — when no size selected', () => {
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows write-up textarea when "Yes — Add Text" is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /yes — add text/i }))
    expect(screen.getByPlaceholderText(/custom caption/i)).toBeInTheDocument()
  })

  it('shows frame restriction notice for compact size (8×10)', () => {
    selectSize('8 × 10')
    expect(screen.getByText(/some frames are unavailable/i)).toBeInTheDocument()
  })

  it('shows all size options including 8×10 and 36×48', () => {
    expect(screen.getByText('8 × 10')).toBeInTheDocument()
    expect(screen.getByText('36 × 48')).toBeInTheDocument()
  })

  it('calls addArtwork when form is complete and button clicked', async () => {
    const addArtwork = jest.fn()
    jest.spyOn(require('@/context/CartContext'), 'useCart').mockReturnValue({ addArtwork })
    uploadPhoto()
    selectSize('20 × 24')
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    await waitFor(() => expect(addArtwork).toHaveBeenCalledTimes(1))
  })
})
