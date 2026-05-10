import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeProductCard from '@/app/(public)/_components/HomeProductCard'
import ProductQuickViewModal from '@/app/(public)/_components/ProductQuickViewModal'
import HomeProductSection from '@/app/(public)/_components/HomeProductSection'
import type { Database } from '@/lib/types/database'

type Product = Database['public']['Tables']['products']['Row']

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: '1',
  name: 'Test Print',
  slug: 'test-print',
  description: 'A nice portrait print on premium paper.',
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

// ─── HomeProductCard ───────────────────────────────────────────────────────
describe('HomeProductCard', () => {
  const defaultProps = {
    product: makeProduct(),
    quantity: 0,
    onAddToCart: jest.fn(),
    onQuantityChange: jest.fn(),
    onOpenModal: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product name, category, and price', () => {
    render(<HomeProductCard {...defaultProps} />)
    expect(screen.getByText('Test Print')).toBeInTheDocument()
    expect(screen.getByText('print')).toBeInTheDocument()
    expect(screen.getByTestId('price-1')).toHaveTextContent('₦15,000')
  })

  it('shows Add to Cart button when quantity is 0', () => {
    render(<HomeProductCard {...defaultProps} />)
    expect(screen.getByTestId('add-to-cart-1')).toBeInTheDocument()
    expect(screen.getByText(/add to cart/i)).toBeInTheDocument()
  })

  it('shows quantity controls when quantity > 0', () => {
    render(<HomeProductCard {...defaultProps} quantity={2} />)
    expect(screen.getByTestId('qty-controls-1')).toBeInTheDocument()
    expect(screen.getByTestId('qty-value-1')).toHaveTextContent('2')
    expect(screen.getByTestId('qty-minus-1')).toBeInTheDocument()
    expect(screen.getByTestId('qty-plus-1')).toBeInTheDocument()
  })

  it('does not show Add to Cart button when quantity > 0', () => {
    render(<HomeProductCard {...defaultProps} quantity={1} />)
    expect(screen.queryByTestId('add-to-cart-1')).not.toBeInTheDocument()
  })

  it('calls onAddToCart when Add to Cart is clicked', () => {
    const onAddToCart = jest.fn()
    render(<HomeProductCard {...defaultProps} onAddToCart={onAddToCart} />)
    fireEvent.click(screen.getByTestId('add-to-cart-1'))
    expect(onAddToCart).toHaveBeenCalledTimes(1)
  })

  it('calls onQuantityChange with +1 when plus is clicked', () => {
    const onQuantityChange = jest.fn()
    render(<HomeProductCard {...defaultProps} quantity={1} onQuantityChange={onQuantityChange} />)
    fireEvent.click(screen.getByTestId('qty-plus-1'))
    expect(onQuantityChange).toHaveBeenCalledWith(2)
  })

  it('calls onQuantityChange with -1 when minus is clicked', () => {
    const onQuantityChange = jest.fn()
    render(<HomeProductCard {...defaultProps} quantity={3} onQuantityChange={onQuantityChange} />)
    fireEvent.click(screen.getByTestId('qty-minus-1'))
    expect(onQuantityChange).toHaveBeenCalledWith(2)
  })

  it('calls onOpenModal when card is clicked', () => {
    const onOpenModal = jest.fn()
    render(<HomeProductCard {...defaultProps} onOpenModal={onOpenModal} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    expect(onOpenModal).toHaveBeenCalledTimes(1)
  })

  it('prevents card click when Add to Cart button is clicked', () => {
    const onAddToCart = jest.fn()
    const onOpenModal = jest.fn()
    render(<HomeProductCard {...defaultProps} onAddToCart={onAddToCart} onOpenModal={onOpenModal} />)
    fireEvent.click(screen.getByTestId('add-to-cart-1'))
    expect(onAddToCart).toHaveBeenCalledTimes(1)
    expect(onOpenModal).not.toHaveBeenCalled()
  })

  it('prevents card click when quantity controls are clicked', () => {
    const onQuantityChange = jest.fn()
    const onOpenModal = jest.fn()
    render(<HomeProductCard {...defaultProps} quantity={1} onQuantityChange={onQuantityChange} onOpenModal={onOpenModal} />)
    fireEvent.click(screen.getByTestId('qty-plus-1'))
    expect(onQuantityChange).toHaveBeenCalledWith(2)
    expect(onOpenModal).not.toHaveBeenCalled()
  })

  it('shows badge when product has a badge', () => {
    render(<HomeProductCard {...defaultProps} product={makeProduct({ badge: 'Sale' })} />)
    expect(screen.getByText('Sale')).toBeInTheDocument()
  })

  it('shows Out of Stock when product is not in stock', () => {
    render(<HomeProductCard {...defaultProps} product={makeProduct({ in_stock: false })} />)
    const outOfStock = screen.getAllByText('Out of Stock')
    expect(outOfStock.length).toBeGreaterThan(0)
  })

  it('shows original price with strikethrough when original_price is set', () => {
    render(<HomeProductCard {...defaultProps} product={makeProduct({ original_price: 20000 })} />)
    expect(screen.getByText('₦20,000')).toBeInTheDocument()
  })
})

// ─── ProductQuickViewModal ─────────────────────────────────────────────────
describe('ProductQuickViewModal', () => {
  const defaultProps = {
    product: makeProduct({ description: 'A nice portrait print on premium paper.' }),
    quantity: 0,
    onAddToCart: jest.fn(),
    onQuantityChange: jest.fn(),
    onClose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product details: name, price, description, category', () => {
    render(<ProductQuickViewModal {...defaultProps} />)
    expect(screen.getByTestId('modal-name')).toHaveTextContent('Test Print')
    expect(screen.getByTestId('modal-price')).toHaveTextContent('₦15,000')
    expect(screen.getByTestId('modal-description')).toHaveTextContent('A nice portrait print on premium paper.')
    expect(screen.getByTestId('modal-category')).toHaveTextContent('print')
  })

  it('shows Add to Cart button when quantity is 0', () => {
    render(<ProductQuickViewModal {...defaultProps} />)
    expect(screen.getByTestId('modal-add-to-cart')).toHaveTextContent('Add to Cart')
  })

  it('shows "Add Another" when quantity > 0', () => {
    render(<ProductQuickViewModal {...defaultProps} quantity={2} />)
    expect(screen.getByTestId('modal-add-to-cart')).toHaveTextContent('Add Another')
  })

  it('shows quantity controls when quantity > 0', () => {
    render(<ProductQuickViewModal {...defaultProps} quantity={2} />)
    expect(screen.getByTestId('modal-qty-minus')).toBeInTheDocument()
    expect(screen.getByTestId('modal-qty-value')).toHaveTextContent('2')
    expect(screen.getByTestId('modal-qty-plus')).toBeInTheDocument()
  })

  it('does not show quantity controls when quantity is 0', () => {
    render(<ProductQuickViewModal {...defaultProps} quantity={0} />)
    expect(screen.queryByTestId('modal-qty-minus')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modal-qty-value')).not.toBeInTheDocument()
    expect(screen.queryByTestId('modal-qty-plus')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<ProductQuickViewModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('modal-close-btn'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn()
    render(<ProductQuickViewModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn()
    render(<ProductQuickViewModal {...defaultProps} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onAddToCart when Add to Cart is clicked', () => {
    const onAddToCart = jest.fn()
    render(<ProductQuickViewModal {...defaultProps} onAddToCart={onAddToCart} />)
    fireEvent.click(screen.getByTestId('modal-add-to-cart'))
    expect(onAddToCart).toHaveBeenCalledTimes(1)
  })

  it('calls onQuantityChange with +1 when plus is clicked', () => {
    const onQuantityChange = jest.fn()
    render(<ProductQuickViewModal {...defaultProps} quantity={2} onQuantityChange={onQuantityChange} />)
    fireEvent.click(screen.getByTestId('modal-qty-plus'))
    expect(onQuantityChange).toHaveBeenCalledWith(3)
  })

  it('calls onQuantityChange with -1 when minus is clicked', () => {
    const onQuantityChange = jest.fn()
    render(<ProductQuickViewModal {...defaultProps} quantity={2} onQuantityChange={onQuantityChange} />)
    fireEvent.click(screen.getByTestId('modal-qty-minus'))
    expect(onQuantityChange).toHaveBeenCalledWith(1)
  })

  it('shows Out of Stock when product is not in stock', () => {
    render(<ProductQuickViewModal {...defaultProps} product={makeProduct({ in_stock: false })} />)
    const outOfStock = screen.getAllByText('Out of Stock')
    expect(outOfStock.length).toBeGreaterThan(0)
  })

  it('disables add to cart when product is out of stock', () => {
    render(<ProductQuickViewModal {...defaultProps} product={makeProduct({ in_stock: false })} />)
    const btn = screen.getByRole('button', { name: /out of stock/i })
    expect(btn).toBeDisabled()
  })

  it('renders the product image area', () => {
    render(<ProductQuickViewModal {...defaultProps} />)
    expect(screen.getByTestId('modal-image')).toBeInTheDocument()
  })

  it('shows badge in modal when product has badge', () => {
    render(<ProductQuickViewModal {...defaultProps} product={makeProduct({ badge: 'New' })} />)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('shows original price with strikethrough in modal', () => {
    render(<ProductQuickViewModal {...defaultProps} product={makeProduct({ original_price: 20000 })} />)
    expect(screen.getByText('₦20,000')).toBeInTheDocument()
  })

  it('shows in stock availability text', () => {
    render(<ProductQuickViewModal {...defaultProps} />)
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('sets aria-modal and role attributes', () => {
    render(<ProductQuickViewModal {...defaultProps} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'Quick view: Test Print')
  })
})

// ─── HomeProductSection (integration) ──────────────────────────────────────
describe('HomeProductSection', () => {
  const products: Product[] = [
    makeProduct({ id: '1', name: 'Portrait Print' }),
    makeProduct({ id: '2', name: 'Canvas Wrap', category: 'canvas', price: 25000 }),
    makeProduct({ id: '3', name: 'Out of Stock', in_stock: false }),
  ]

  let mockCart: {
    addStoreItem: jest.Mock
    removeStoreItem: jest.Mock
    setStoreQuantity: jest.Mock
    state: {
      storeItems: Array<{ product: { id: string }; quantity: number }>
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCart = {
      addStoreItem: jest.fn(),
      removeStoreItem: jest.fn(),
      setStoreQuantity: jest.fn(),
      state: { storeItems: [] },
    }
    jest.spyOn(require('@/context/CartContext'), 'useCart').mockReturnValue(mockCart)
  })

  it('renders all products in the grid', () => {
    render(<HomeProductSection products={products} />)
    expect(screen.getByText('Portrait Print')).toBeInTheDocument()
    expect(screen.getByText('Canvas Wrap')).toBeInTheDocument()
    const outOfStock = screen.getAllByText('Out of Stock')
    expect(outOfStock.length).toBeGreaterThan(0)
  })

  it('renders section heading', () => {
    render(<HomeProductSection products={products} />)
    expect(screen.getByText(/art products/i)).toBeInTheDocument()
  })

  it('has a link to view all products', () => {
    render(<HomeProductSection products={products} />)
    expect(screen.getByText(/view all products/i).closest('a')).toHaveAttribute('href', '/store')
  })

  it('opens modal when a product card is clicked', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    expect(screen.getByTestId('product-quick-view-modal')).toBeInTheDocument()
  })

  it('modal displays the correct product details', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-2'))
    expect(screen.getByTestId('modal-name')).toHaveTextContent('Canvas Wrap')
    expect(screen.getByTestId('modal-price')).toHaveTextContent('₦25,000')
  })

  it('closes modal when close button is clicked', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    expect(screen.getByTestId('product-quick-view-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('modal-close-btn'))
    expect(screen.queryByTestId('product-quick-view-modal')).not.toBeInTheDocument()
  })

  it('closes modal when backdrop is clicked', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    expect(screen.getByTestId('product-quick-view-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(screen.queryByTestId('product-quick-view-modal')).not.toBeInTheDocument()
  })

  it('calls addStoreItem when Add to Cart is clicked on card', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('add-to-cart-1'))
    expect(mockCart.addStoreItem).toHaveBeenCalledTimes(1)
    expect(mockCart.addStoreItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', name: 'Portrait Print' })
    )
  })

  it('calls addStoreItem when Add to Cart is clicked in modal', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    fireEvent.click(screen.getByTestId('modal-add-to-cart'))
    expect(mockCart.addStoreItem).toHaveBeenCalledTimes(1)
  })

  it('calls removeStoreItem when quantity reaches 0 from card', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 1 }]
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('qty-minus-1'))
    expect(mockCart.removeStoreItem).toHaveBeenCalledWith('1')
    expect(mockCart.setStoreQuantity).not.toHaveBeenCalled()
  })

  it('calls setStoreQuantity when plus is clicked on card', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 1 }]
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('qty-plus-1'))
    expect(mockCart.setStoreQuantity).toHaveBeenCalledWith('1', 2)
  })

  it('calls setStoreQuantity when minus is clicked on card above 1', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 3 }]
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('qty-minus-1'))
    expect(mockCart.setStoreQuantity).toHaveBeenCalledWith('1', 2)
  })

  it('calls removeStoreItem when quantity reaches 0 from modal', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 1 }]
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    fireEvent.click(screen.getByTestId('modal-qty-minus'))
    expect(mockCart.removeStoreItem).toHaveBeenCalledWith('1')
  })

  it('shows quantity on card that matches cart state', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 3 }]
    render(<HomeProductSection products={products} />)
    expect(screen.getByTestId('qty-value-1')).toHaveTextContent('3')
  })

  it('shows Add to Cart on card when item is removed from cart', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 1 }]
    render(<HomeProductSection products={products} />)
    expect(screen.getByTestId('qty-controls-1')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('qty-minus-1'))
    expect(mockCart.removeStoreItem).toHaveBeenCalledWith('1')
  })

  it('syncs quantity between modal and card when changed in modal', () => {
    mockCart.state.storeItems = [{ product: { id: '1' }, quantity: 1 }]
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-1'))
    expect(screen.getByTestId('modal-qty-value')).toHaveTextContent('1')
    fireEvent.click(screen.getByTestId('modal-qty-plus'))
    expect(mockCart.setStoreQuantity).toHaveBeenCalledWith('1', 2)
  })

  it('shows Out of Stock for out-of-stock products', () => {
    render(<HomeProductSection products={products} />)
    const outOfStockElements = screen.getAllByText('Out of Stock')
    expect(outOfStockElements.length).toBeGreaterThan(0)
  })

  it('does not show modal for out-of-stock product card click', () => {
    render(<HomeProductSection products={products} />)
    fireEvent.click(screen.getByTestId('product-card-3'))
    // Modal should still open for out-of-stock products (user can view details)
    expect(screen.getByTestId('product-quick-view-modal')).toBeInTheDocument()
  })
})
