import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import GalleryPageContent from '@/app/(public)/gallery/GalleryPageContent'
import type { GalleryItem } from '@/app/actions/gallery'

jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>)
jest.mock('@/components/layout/PublicLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>)
jest.mock('@/components/ui', () => ({ SectionTag: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }))
jest.mock('@/components/ui/StarRating', () => () => <div data-testid="star-rating" />)
jest.mock('@/context/CartContext', () => ({
  useCart: () => ({ state: { ratings: {} }, rateProduct: jest.fn() }),
}))

const makeItem = (overrides: Partial<GalleryItem> = {}): GalleryItem => ({
  id: '1', title: 'Test Portrait', category: 'portrait', medium: 'Charcoal',
  image_url: '/img.jpg', storage_path: '/path/img.jpg', year: 2024, size: '16x20',
  description: 'A test piece', featured: false, sort_order: 0,
  created_at: '2024-01-01', updated_at: '2024-01-01',
  ...overrides,
})

describe('GalleryPageContent', () => {
  it('renders category filter buttons', () => {
    render(<GalleryPageContent items={[]} />)
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /portrait/i })).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    render(<GalleryPageContent items={[]} />)
    expect(screen.getByText(/no artworks in this category/i)).toBeInTheDocument()
  })

  it('renders gallery items', () => {
    render(<GalleryPageContent items={[makeItem()]} />)
    expect(screen.getByText('Test Portrait')).toBeInTheDocument()
    expect(screen.getByText('Charcoal · 16x20')).toBeInTheDocument()
  })

  it('filters items by category', () => {
    const items = [
      makeItem({ id: '1', title: 'Portrait One', category: 'portrait' }),
      makeItem({ id: '2', title: 'Couple Two', category: 'couple' }),
    ]
    render(<GalleryPageContent items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /couple/i }))
    expect(screen.queryByText('Portrait One')).not.toBeInTheDocument()
    expect(screen.getByText('Couple Two')).toBeInTheDocument()
  })

  it('opens lightbox when item is clicked', () => {
    render(<GalleryPageContent items={[makeItem()]} />)
    fireEvent.click(screen.getByText('Test Portrait'))
    // Lightbox shows title twice (card + lightbox)
    expect(screen.getAllByText('Test Portrait').length).toBeGreaterThan(1)
  })

  it('closes lightbox on close button click', () => {
    render(<GalleryPageContent items={[makeItem()]} />)
    fireEvent.click(screen.getByText('Test Portrait'))
    const closeBtn = screen.getByRole('button', { name: /✕/i })
    fireEvent.click(closeBtn)
    expect(screen.getAllByText('Test Portrait').length).toBe(1)
  })

  it('renders CTA links', () => {
    render(<GalleryPageContent items={[]} />)
    expect(screen.getByRole('link', { name: /order custom artwork/i })).toHaveAttribute('href', '/custom-artwork')
    expect(screen.getByRole('link', { name: /photo enlargement/i })).toHaveAttribute('href', '/photo-enlarge')
  })
})
