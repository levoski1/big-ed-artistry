import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StorePageContent from '@/app/(public)/store/StorePageContent'
import type { Database } from '@/lib/types/database'

jest.mock('@/components/layout/PublicLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>)
jest.mock('@/components/ui', () => ({
  PageHero: ({ tag, title }: { tag: string; title: React.ReactNode }) => <div><span>{tag}</span><div>{title}</div></div>,
}))
jest.mock('@/context/CartContext', () => ({
  useCart: () => ({ addStoreItem: jest.fn() }),
}))

type Product = Database['public']['Tables']['products']['Row']

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Print',
  slug: 'test-print',
  description: 'A nice print',
  price: 15000,
  original_price: null,
  category: 'print',
  badge: null,
  in_stock: true,
  featured: false,
  rating: 4.5,
  image_url: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  ...overrides,
})

const products: Product[] = [
  makeProduct({ id: '1', name: 'Portrait Print', category: 'print' }),
  makeProduct({ id: '2', name: 'Canvas Wrap', category: 'canvas' }),
  makeProduct({ id: '3', name: 'Out of Stock Item', category: 'print', in_stock: false }),
]

describe('StorePageContent', () => {
  it('renders the Store tag via PageHero', () => {
    render(<StorePageContent products={products} />)
    expect(screen.getByText('Store')).toBeInTheDocument()
  })

  it('shows all products by default (All filter)', () => {
    render(<StorePageContent products={products} />)
    expect(screen.getByText('Portrait Print')).toBeInTheDocument()
    expect(screen.getByText('Canvas Wrap')).toBeInTheDocument()
  })

  it('shows correct product count', () => {
    render(<StorePageContent products={products} />)
    expect(screen.getByText('3 products')).toBeInTheDocument()
  })

  it('filters to only print products when "Print" is clicked', () => {
    render(<StorePageContent products={products} />)
    fireEvent.click(screen.getByRole('button', { name: /^print$/i }))
    expect(screen.getByText('Portrait Print')).toBeInTheDocument()
    expect(screen.queryByText('Canvas Wrap')).not.toBeInTheDocument()
  })

  it('shows empty state when a category has no products', () => {
    render(<StorePageContent products={products} />)
    fireEvent.click(screen.getByRole('button', { name: /^bundle$/i }))
    expect(screen.getByText(/no products in this category/i)).toBeInTheDocument()
  })

  it('renders "Out of Stock" overlay for out-of-stock products', () => {
    render(<StorePageContent products={products} />)
    const overlays = screen.getAllByText('Out of Stock')
    expect(overlays.length).toBeGreaterThan(0)
  })

  it('disables Add to Cart button for out-of-stock products', () => {
    render(<StorePageContent products={products} />)
    const outOfStockBtns = screen.getAllByRole('button', { name: /out of stock/i })
    outOfStockBtns.forEach(btn => expect(btn).toBeDisabled())
  })

  it('calls addStoreItem when Add to Cart is clicked for in-stock product', () => {
    const addStoreItem = jest.fn()
    jest.spyOn(require('@/context/CartContext'), 'useCart').mockReturnValue({ addStoreItem })
    render(<StorePageContent products={[makeProduct()]} />)
    fireEvent.click(screen.getByRole('button', { name: /\+ add to cart/i }))
    expect(addStoreItem).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when products array is empty', () => {
    render(<StorePageContent products={[]} />)
    expect(screen.getByText(/no products in this category/i)).toBeInTheDocument()
  })

  it('shows badge label when product has a badge', () => {
    render(<StorePageContent products={[makeProduct({ badge: 'New' })]} />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })
})
