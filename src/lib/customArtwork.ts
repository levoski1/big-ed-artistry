export type SizeOption = { label: string; width: number; height: number }
export type RateOption = { id: string; name: string; rate: number; preview: string }
export type DeliveryLocation = 'none' | 'ph' | 'rivers' | 'outside'
export type PaymentType = 'full' | 'part'

export interface CartOrder {
  id: string
  artworkType: string
  sizeLabel: string
  width: number
  height: number
  area: number
  canvasId: string
  canvasName: string
  frameId: string
  frameName: string
  glassId: string
  glassName: string
  writeUpType: 'yes' | 'no'
  customMessage: string
  occasion: string
  imageName: string
  receiptName: string
  address: string
  phoneNumber: string
  busStop: string
  location: DeliveryLocation
  paymentType: PaymentType
  basePrice: number
  canvasPrice: number
  framePrice: number
  glassPrice: number
  deliveryFee: number
  totalPrice: number
  createdAt: string
}

export const sizeOptions: SizeOption[] = [
  { label: '8 × 10', width: 8, height: 10 },
  { label: '10 × 12', width: 10, height: 12 },
  { label: '12 × 16', width: 12, height: 16 },
  { label: '16 × 20', width: 16, height: 20 },
  { label: '16 × 24', width: 16, height: 24 },
  { label: '20 × 24', width: 20, height: 24 },
  { label: '20 × 30', width: 20, height: 30 },
  { label: '24 × 36', width: 24, height: 36 },
  { label: '36 × 48', width: 36, height: 48 },
]

export const canvasOptions: RateOption[] = [
  { id: 'normal', name: 'Normal', rate: 13, preview: 'linear-gradient(140deg, #4c4a45, #2c2a26)' },
  { id: 'smooth', name: 'Smooth', rate: 14, preview: 'linear-gradient(140deg, #76736c, #3f3b34)' },
  { id: 'crystal', name: 'Crystal', rate: 16, preview: 'linear-gradient(140deg, #8f8a80, #575144)' },
  { id: 'none', name: 'None', rate: 0, preview: 'linear-gradient(140deg, #2a2622, #1a1815)' },
]

export const frameOptions: RateOption[] = [
  { id: 'none', name: 'None', rate: 0, preview: 'linear-gradient(140deg, #25211c, #171511)' },
  { id: 'small', name: 'Small', rate: 32, preview: 'linear-gradient(140deg, #6f5931, #3f2f18)' },
  { id: 'medium', name: 'Medium', rate: 39, preview: 'linear-gradient(140deg, #4c4a45, #2c2a26)' },
  { id: 'large', name: 'Large', rate: 75, preview: 'linear-gradient(140deg, #8b6f3d, #4a3418)' },
  { id: 'frameless', name: 'Frameless', rate: 41, preview: 'linear-gradient(140deg, #2a2622, #1a1815)' },
  { id: 'premium', name: 'Premium', rate: 100, preview: 'linear-gradient(140deg, #b08b48, #6f4c1c)' },
]

export const glassOptions: RateOption[] = [
  { id: 'none', name: 'None', rate: 0, preview: 'linear-gradient(140deg, #2a2622, #1a1815)' },
  { id: '2mm', name: '2mm', rate: 14, preview: 'linear-gradient(140deg, #6e7b86, #394550)' },
  { id: '3mm', name: '3mm', rate: 16, preview: 'linear-gradient(140deg, #8b9ba8, #4b5963)' },
]

export const deliveryFees: Record<DeliveryLocation, number> = {
  none: 0,
  ph: 2000,
  rivers: 5000,
  outside: 10000,
}

export const CART_STORAGE_KEY = 'biged_custom_art_cart'

export function getCartOrders(): CartOrder[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(CART_STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as CartOrder[]
  } catch {
    return []
  }
}

export function saveCartOrders(orders: CartOrder[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(orders))
}

export function addCartOrder(order: CartOrder) {
  const existing = getCartOrders()
  saveCartOrders([order, ...existing])
}

export function updateCartOrder(orderId: string, patch: Partial<CartOrder>) {
  const existing = getCartOrders()
  const updated = existing.map(order => (order.id === orderId ? { ...order, ...patch } : order))
  saveCartOrders(updated)
  return updated
}

export function removeCartOrder(orderId: string) {
  const existing = getCartOrders()
  const updated = existing.filter(order => order.id !== orderId)
  saveCartOrders(updated)
  return updated
}

export function locationLabel(location: DeliveryLocation): string {
  if (location === 'ph') return 'Port Harcourt'
  if (location === 'rivers') return 'Rivers State'
  if (location === 'outside') return 'Outside Rivers'
  return 'None'
}

export function calculateTotal(area: number, canvasRate: number, frameRate: number, glassRate: number, deliveryFee: number) {
  const basePrice = area * 90
  const canvasPrice = area * canvasRate
  const framePrice = area * frameRate
  const glassPrice = area * glassRate
  const totalPrice = basePrice + canvasPrice + framePrice + glassPrice + deliveryFee
  return { basePrice, canvasPrice, framePrice, glassPrice, totalPrice }
}
