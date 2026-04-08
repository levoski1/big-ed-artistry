// Pure pricing calculations — no DB calls
// All prices in Naira (₦), matching customArtwork.ts

export const BASE_RATE_PER_SQIN = 90 // ₦ per sq inch

export const CANVAS_RATES: Record<string, number> = {
  normal: 13, smooth: 14, crystal: 16, none: 0,
}

export const FRAME_RATES: Record<string, number> = {
  none: 0, small: 32, medium: 39, large: 75, frameless: 41, premium: 100,
}

export const GLASS_RATES: Record<string, number> = {
  none: 0, '2mm': 14, '3mm': 16,
}

export const DELIVERY_FEES: Record<string, number> = {
  port_harcourt: 2000,
  rivers_state: 5000,
  outside_rivers: 10000,
}

export function calcItemPrice(
  areaSqIn: number,
  canvasOption: string,
  frameOption: string,
  glassOption: string
) {
  const basePrice    = areaSqIn * BASE_RATE_PER_SQIN
  const canvasPrice  = areaSqIn * (CANVAS_RATES[canvasOption] ?? 0)
  const framePrice   = areaSqIn * (FRAME_RATES[frameOption] ?? 0)
  const glassPrice   = areaSqIn * (GLASS_RATES[glassOption] ?? 0)
  const itemSubtotal = basePrice + canvasPrice + framePrice + glassPrice
  return { basePrice, canvasPrice, framePrice, glassPrice, itemSubtotal }
}

export function calcOrderTotal(
  items: { item_subtotal: number }[],
  deliveryLocation: string
) {
  const subtotal    = items.reduce((sum, i) => sum + i.item_subtotal, 0)
  const deliveryFee = DELIVERY_FEES[deliveryLocation] ?? 0
  const totalAmount = subtotal + deliveryFee
  return { subtotal, deliveryFee, totalAmount }
}

export function calcPaymentSplit(totalAmount: number, type: 'full' | 'partial') {
  const amountDue      = type === 'partial' ? Math.ceil(totalAmount * 0.5) : totalAmount
  const amountRemaining = totalAmount - amountDue
  return { amountDue, amountRemaining }
}
