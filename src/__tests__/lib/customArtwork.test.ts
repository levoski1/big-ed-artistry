import {
  calculateTotal,
  canvasOptions,
  frameOptions,
  glassOptions,
  sizeOptions,
} from '@/lib/customArtwork'

describe('calculateTotal', () => {
  it('returns zero prices for zero area', () => {
    const result = calculateTotal(0, 13, 32, 14, 0)
    expect(result.basePrice).toBe(0)
    expect(result.totalPrice).toBe(0)
  })

  it('calculates basePrice as area * 90', () => {
    const { basePrice } = calculateTotal(192, 0, 0, 0, 0)
    expect(basePrice).toBe(192 * 90)
  })

  it('adds canvas, frame, glass rates to area', () => {
    const area = 192 // 16x12
    const { canvasPrice, framePrice, glassPrice } = calculateTotal(area, 13, 32, 14, 0)
    expect(canvasPrice).toBe(area * 13)
    expect(framePrice).toBe(area * 32)
    expect(glassPrice).toBe(area * 14)
  })

  it('includes delivery fee in totalPrice', () => {
    const { totalPrice } = calculateTotal(100, 0, 0, 0, 2000)
    expect(totalPrice).toBe(100 * 90 + 2000)
  })

  it('sums all components correctly', () => {
    const area = 20 * 24 // 480
    const { totalPrice, basePrice, canvasPrice, framePrice, glassPrice } =
      calculateTotal(area, 13, 39, 14, 5000)
    expect(totalPrice).toBe(basePrice + canvasPrice + framePrice + glassPrice + 5000)
  })
})

describe('option data', () => {
  it('canvasOptions includes a "none" option with rate 0', () => {
    const none = canvasOptions.find(o => o.id === 'none')
    expect(none).toBeDefined()
    expect(none!.rate).toBe(0)
  })

  it('frameOptions includes "none", "small", "medium", "large", "frameless", "premium"', () => {
    const ids = frameOptions.map(o => o.id)
    expect(ids).toEqual(expect.arrayContaining(['none', 'small', 'medium', 'large', 'frameless', 'premium']))
  })

  it('glassOptions has exactly 3 entries', () => {
    expect(glassOptions).toHaveLength(3)
  })

  it('sizeOptions contains 8x10 and 36x48', () => {
    expect(sizeOptions.some(s => s.width === 8 && s.height === 10)).toBe(true)
    expect(sizeOptions.some(s => s.width === 36 && s.height === 48)).toBe(true)
  })
})
