'use client'
import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { CartOrder } from '@/lib/customArtwork'

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
  toast: string | null
}

type CartAction =
  | { type: 'ADD_ARTWORK'; order: CartOrder }
  | { type: 'REMOVE_ARTWORK'; id: string }
  | { type: 'ADD_STORE_ITEM'; product: StoreProduct }
  | { type: 'REMOVE_STORE_ITEM'; productId: string }
  | { type: 'SET_STORE_QUANTITY'; productId: string; quantity: number }
  | { type: 'RATE_PRODUCT'; productId: string; rating: number }
  | { type: 'SET_TOAST'; message: string | null }
  | { type: 'HYDRATE'; state: Partial<CartState> }

// ─── Reducer ──────────────────────────────────────────────────────────────
function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.state }

    case 'ADD_ARTWORK': {
      const exists = state.artworkOrders.find(o => o.id === action.order.id)
      if (exists) return state
      return { ...state, artworkOrders: [action.order, ...state.artworkOrders], toast: 'Artwork added to cart!' }
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
          toast: `${action.product.name} quantity updated!`,
        }
      }
      return {
        ...state,
        storeItems: [...state.storeItems, { type: 'store', product: action.product, quantity: 1 }],
        toast: `${action.product.name} added to cart!`,
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

    case 'SET_TOAST':
      return { ...state, toast: action.message }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'biged_cart_v2'

const initial: CartState = { artworkOrders: [], storeItems: [], ratings: {}, toast: null }

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
  dismissToast: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CartState>
        dispatch({ type: 'HYDRATE', state: saved })
      }
    } catch { /* ignore */ }
  }, [])

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        artworkOrders: state.artworkOrders,
        storeItems: state.storeItems,
        ratings: state.ratings,
      }))
    } catch { /* ignore */ }
  }, [state.artworkOrders, state.storeItems, state.ratings])

  // Auto-dismiss toast
  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'SET_TOAST', message: null }), 3000)
    return () => clearTimeout(t)
  }, [state.toast])

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
  const dismissToast = useCallback(() => dispatch({ type: 'SET_TOAST', message: null }), [])

  return (
    <CartContext.Provider value={{ state, totalCount, grandTotal, artworkTotal, storeTotal, addArtwork, removeArtwork, addStoreItem, removeStoreItem, setStoreQuantity, rateProduct, dismissToast }}>
      {children}
      {/* Toast notification */}
      {state.toast && (
        <div className="toast-container" style={{
          position: 'fixed', bottom: 32, right: 32, zIndex: 9000,
          background: 'var(--bg-card)', border: '1px solid var(--gold-primary)',
          padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: 'var(--shadow-md)',
          animation: 'fadeInUp 0.3s ease',
          transition: 'background 0.35s ease, border-color 0.35s ease',
        }}>
          <span style={{ color: 'var(--gold-light)', fontSize: 16 }}>✦</span>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{state.toast}</span>
          <button onClick={dismissToast} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, marginLeft: 8 }}>✕</button>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
