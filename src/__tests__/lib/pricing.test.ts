import {
  calcItemPrice, calcOrderTotal, calcPaymentSplit, calcBulkDiscount,
  CANVAS_RATES, FRAME_RATES, GLASS_RATES, DELIVERY_FEES, BASE_RATE_PER_SQIN,
} from '@/lib/services/pricing'

describe('calcItemPrice', () => {
  it('calculates base price as area * 90', () => {
    const { basePrice } = calcItemPrice(100, 'none', 'none', 'none')
    expect(basePrice).toBe(100 * BASE_RATE_PER_SQIN)
  })

  it('adds canvas rate', () => {
    const { canvasPrice } = calcItemPrice(100, 'normal', 'none', 'none')
    expect(canvasPrice).toBe(100 * CANVAS_RATES.normal)
  })

  it('adds frame rate', () => {
    const { framePrice } = calcItemPrice(100, 'none', 'small', 'none')
    expect(framePrice).toBe(100 * FRAME_RATES.small)
  })

  it('adds glass rate', () => {
    const { glassPrice } = calcItemPrice(100, 'none', 'none', '2mm')
    expect(glassPrice).toBe(100 * GLASS_RATES['2mm'])
  })

  it('itemSubtotal equals sum of all components', () => {
    const area = 192
    const { basePrice, canvasPrice, framePrice, glassPrice, itemSubtotal } =
      calcItemPrice(area, 'smooth', 'medium', '3mm')
    expect(itemSubtotal).toBe(basePrice + canvasPrice + framePrice + glassPrice)
  })

  it('returns zero prices for zero area', () => {
    const { itemSubtotal } = calcItemPrice(0, 'normal', 'small', '2mm')
    expect(itemSubtotal).toBe(0)
  })

  it('uses 0 for unknown options', () => {
    const { canvasPrice, framePrice, glassPrice } = calcItemPrice(100, 'unknown', 'unknown', 'unknown')
    expect(canvasPrice).toBe(0)
    expect(framePrice).toBe(0)
    expect(glassPrice).toBe(0)
  })
})

describe('calcOrderTotal', () => {
  it('sums item subtotals', () => {
    const items = [{ item_subtotal: 10000 }, { item_subtotal: 20000 }]
    const { subtotal } = calcOrderTotal(items, 'port_harcourt')
    expect(subtotal).toBe(30000)
  })

  it('adds delivery fee', () => {
    const items = [{ item_subtotal: 10000 }]
    const { deliveryFee, totalAmount } = calcOrderTotal(items, 'port_harcourt')
    expect(deliveryFee).toBe(DELIVERY_FEES.port_harcourt)
    expect(totalAmount).toBe(10000 + DELIVERY_FEES.port_harcourt)
  })

  it('uses 0 for unknown delivery location', () => {
    const { deliveryFee } = calcOrderTotal([{ item_subtotal: 5000 }], 'unknown_location')
    expect(deliveryFee).toBe(0)
  })

  it('handles empty items array', () => {
    const { subtotal, totalAmount } = calcOrderTotal([], 'port_harcourt')
    expect(subtotal).toBe(0)
    expect(totalAmount).toBe(DELIVERY_FEES.port_harcourt)
  })
})

describe('calcPaymentSplit', () => {
  it('full payment returns full amount due', () => {
    const { amountDue, amountRemaining } = calcPaymentSplit(100000, 'full')
    expect(amountDue).toBe(100000)
    expect(amountRemaining).toBe(0)
  })

  it('partial payment returns 50% ceiling', () => {
    const { amountDue, amountRemaining } = calcPaymentSplit(100000, 'partial')
    expect(amountDue).toBe(50000)
    expect(amountRemaining).toBe(50000)
  })

  it('partial payment rounds up for odd amounts', () => {
    const { amountDue } = calcPaymentSplit(10001, 'partial')
    expect(amountDue).toBe(Math.ceil(10001 * 0.5))
  })
})

describe('calcBulkDiscount', () => {
  it('returns no discount for 1 item', () => {
    const { discountRate, discountAmount } = calcBulkDiscount(1, 50000)
    expect(discountRate).toBe(0)
    expect(discountAmount).toBe(0)
  })

  it('returns 10% for 2 items', () => {
    const { discountRate, discountAmount } = calcBulkDiscount(2, 100000)
    expect(discountRate).toBe(0.10)
    expect(discountAmount).toBe(10000)
  })

  it('returns 12% for 3 items', () => {
    const { discountRate } = calcBulkDiscount(3, 100000)
    expect(discountRate).toBe(0.12)
  })

  it('returns 15% for 4 items', () => {
    const { discountRate } = calcBulkDiscount(4, 100000)
    expect(discountRate).toBe(0.15)
  })

  it('returns 20% for 5+ items', () => {
    const { discountRate, discountLabel } = calcBulkDiscount(5, 100000)
    expect(discountRate).toBe(0.20)
    expect(discountLabel).toContain('20%')
  })

  it('floors discount amount', () => {
    const { discountAmount } = calcBulkDiscount(2, 10001)
    expect(discountAmount).toBe(Math.floor(10001 * 0.10))
  })
})

describe('rate tables', () => {
  it('CANVAS_RATES has none=0', () => expect(CANVAS_RATES.none).toBe(0))
  it('FRAME_RATES has none=0', () => expect(FRAME_RATES.none).toBe(0))
  it('GLASS_RATES has none=0', () => expect(GLASS_RATES.none).toBe(0))
  it('DELIVERY_FEES has port_harcourt', () => expect(DELIVERY_FEES.port_harcourt).toBe(2000))
  it('DELIVERY_FEES outside_rivers is highest', () => {
    expect(DELIVERY_FEES.outside_rivers).toBeGreaterThan(DELIVERY_FEES.rivers_state)
    expect(DELIVERY_FEES.rivers_state).toBeGreaterThan(DELIVERY_FEES.port_harcourt)
  })
})
