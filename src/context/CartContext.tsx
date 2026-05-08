'use client'
import { createContext, useCallback, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import type { CartOrder } from '@/lib/customArtwork'
import CartSuccessModal from '@/components/ui/CartSuccessModal'

// ─── Types ────────────────────────────────────────────────────────────────
export interface StoreProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  originalPrice?: number
  category: string
  badge?: string
  inStock: boolean
  featured: boolean
  rating: number      // 1-5, stored in state
  userRating?: number // what this user has rated
  quantity?: number
}

export interface CartStoreItem {
  type: 'store'
  product: StoreProduct
  quantity: number
}

export type CartItem =
  | { type: 'artwork'; order: CartOrder }
  | CartStoreItem

interface CartState {
  artworkOrders: CartOrder[]
  storeItems: CartStoreItem[]
  ratings: Record<string, number>  // productId → user rating
  cartModal: { itemName: string } | null
}

type CartAction =
  | { type: 'ADD_ARTWORK'; order: CartOrder }
  | { type: 'REMOVE_ARTWORK'; id: string }
  | { type: 'ADD_STORE_ITEM'; product: StoreProduct }
  | { type: 'REMOVE_STORE_ITEM'; productId: string }
  | { type: 'SET_STORE_QUANTITY'; productId: string; quantity: number }
  | { type: 'RATE_PRODUCT'; productId: string; rating: number }
  | { type: 'SET_CART_MODAL'; payload: { itemName: string } | null }
  | { type: 'HYDRATE'; state: Partial<CartState> }
  | { type: 'CLEAR_CART' }

// ─── Reducer ──────────────────────────────────────────────────────────────
function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.state }

    case 'ADD_ARTWORK': {
      const exists = state.artworkOrders.find(o => o.id === action.order.id)
      if (exists) return state
      return { ...state, artworkOrders: [action.order, ...state.artworkOrders], cartModal: { itemName: 'Artwork' } }
    }

    case 'REMOVE_ARTWORK':
      return { ...state, artworkOrders: state.artworkOrders.filter(o => o.id !== action.id) }

    case 'ADD_STORE_ITEM': {
      const existing = state.storeItems.find(i => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          storeItems: state.storeItems.map(i =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
          cartModal: { itemName: action.product.name },
        }
      }
      return {
        ...state,
        storeItems: [...state.storeItems, { type: 'store', product: action.product, quantity: 1 }],
        cartModal: { itemName: action.product.name },
      }
    }

    case 'REMOVE_STORE_ITEM':
      return { ...state, storeItems: state.storeItems.filter(i => i.product.id !== action.productId) }

    case 'SET_STORE_QUANTITY':
      return {
        ...state,
        storeItems: state.storeItems.map(i =>
          i.product.id === action.productId ? { ...i, quantity: Math.max(1, action.quantity) } : i
        ),
      }

    case 'RATE_PRODUCT':
      return { ...state, ratings: { ...state.ratings, [action.productId]: action.rating } }

    case 'CLEAR_CART':
      return { ...state, artworkOrders: [], storeItems: [] }

    case 'SET_CART_MODAL':
      return { ...state, cartModal: action.payload }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'biged_cart_v2'

const initial: CartState = { artworkOrders: [], storeItems: [], ratings: {}, cartModal: null }

interface CartContextValue {
  state: CartState
  totalCount: number
  grandTotal: number
  artworkTotal: number
  storeTotal: number
  addArtwork: (order: CartOrder) => void
  removeArtwork: (id: string) => void
  addStoreItem: (product: StoreProduct) => void
  removeStoreItem: (productId: string) => void
  setStoreQuantity: (productId: string, qty: number) => void
  rateProduct: (productId: string, rating: number) => void
  clearCart: () => void
  dismissCartModal: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CartState>
        dispatch({ type: 'HYDRATE', state: saved })
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Persist to localStorage — only after hydration to avoid overwriting saved data
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        artworkOrders: state.artworkOrders,
        storeItems: state.storeItems,
        ratings: state.ratings,
      }))
    } catch { /* ignore */ }
  }, [hydrated, state.artworkOrders, state.storeItems, state.ratings])

  const artworkTotal = state.artworkOrders.reduce((s, o) => s + o.totalPrice, 0)
  const storeTotal = state.storeItems.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const grandTotal = artworkTotal + storeTotal
  const totalCount = state.artworkOrders.length + state.storeItems.reduce((s, i) => s + i.quantity, 0)

  const addArtwork = useCallback((order: CartOrder) => dispatch({ type: 'ADD_ARTWORK', order }), [])
  const removeArtwork = useCallback((id: string) => dispatch({ type: 'REMOVE_ARTWORK', id }), [])
  const addStoreItem = useCallback((product: StoreProduct) => dispatch({ type: 'ADD_STORE_ITEM', product }), [])
  const removeStoreItem = useCallback((productId: string) => dispatch({ type: 'REMOVE_STORE_ITEM', productId }), [])
  const setStoreQuantity = useCallback((productId: string, qty: number) => dispatch({ type: 'SET_STORE_QUANTITY', productId, quantity: qty }), [])
  const rateProduct = useCallback((productId: string, rating: number) => dispatch({ type: 'RATE_PRODUCT', productId, rating }), [])
  const dismissCartModal = useCallback(() => dispatch({ type: 'SET_CART_MODAL', payload: null }), [])
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [])

  return (
    <CartContext.Provider value={{ state, totalCount, grandTotal, artworkTotal, storeTotal, addArtwork, removeArtwork, addStoreItem, removeStoreItem, setStoreQuantity, rateProduct, clearCart, dismissCartModal }}>
      {children}
      {state.cartModal && (
        <CartSuccessModal
          itemName={state.cartModal.itemName}
          onClose={dismissCartModal}
        />
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
