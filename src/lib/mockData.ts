import type { Order, Payment, Testimonial, DashboardStats, Artwork } from '@/types'
import type { StoreProduct } from '@/context/CartContext'

export const mockArtworks: Artwork[] = [
  { id: '1', title: 'Portrait Study I', medium: 'Pencil on Paper', size: '16×20', year: 2024, image: '', category: 'portrait', featured: true, description: 'A striking single-subject pencil portrait capturing natural light.' },
  { id: '2', title: 'The Wedding Day', medium: 'Charcoal', size: '20×24', year: 2024, image: '', category: 'wedding', featured: true, description: 'Couple portrayed in timeless charcoal with premium framing.' },
  { id: '3', title: 'Mother & Child', medium: 'Pencil', size: '16×20', year: 2023, image: '', category: 'family', featured: true, description: 'Tender moment immortalised in pencil with smooth canvas.' },
  { id: '4', title: 'The Couple', medium: 'Charcoal', size: '20×24', year: 2023, image: '', category: 'couple', featured: false, description: 'Romantic portrait with detailed background.' },
  { id: '5', title: 'In Memoriam', medium: 'Pencil', size: '16×20', year: 2023, image: '', category: 'memorial', featured: false, description: 'A tribute portrait crafted with care for a loved one.' },
  { id: '6', title: 'Family of Five', medium: 'Charcoal', size: '24×36', year: 2024, image: '', category: 'family', featured: true, description: 'Large-format family group portrait with indoor scene.' },
  { id: '7', title: 'The Graduate', medium: 'Pencil', size: '16×20', year: 2024, image: '', category: 'portrait', featured: false, description: 'Celebratory graduation portrait in pencil.' },
  { id: '8', title: 'Eternal Vows', medium: 'Charcoal', size: '20×30', year: 2024, image: '', category: 'wedding', featured: true, description: 'Dramatic charcoal wedding piece with premium framing.' },
]

export const mockProducts: StoreProduct[] = [
  { id: '1', name: 'Single Portrait Print', slug: 'single-portrait-print', description: 'Premium A4 print of a single-subject hand-drawn portrait on 300gsm art paper.', price: 12000, originalPrice: 15000, category: 'print', badge: 'Sale', inStock: true, featured: true, rating: 5 },
  { id: '2', name: 'Family Portrait Bundle', slug: 'family-portrait-bundle', description: 'A3 charcoal family portrait up to 4 subjects. Smooth canvas and medium frame included.', price: 45000, category: 'bundle', badge: 'Popular', inStock: true, featured: true, rating: 5 },
  { id: '3', name: 'A2 Canvas Print', slug: 'a2-canvas-print', description: 'Museum-quality canvas print of your commissioned artwork. Ready to hang.', price: 28000, category: 'canvas', inStock: true, featured: false, rating: 4 },
  { id: '4', name: 'Couple Portraits Bundle', slug: 'couple-portraits-bundle', description: 'Two individual A3 charcoal portraits at a bundled rate. Perfect anniversary gift.', price: 60000, originalPrice: 75000, category: 'bundle', badge: 'Bundle', inStock: true, featured: true, rating: 5 },
  { id: '5', name: 'Premium Framed Print', slug: 'premium-framed-print', description: 'A3 portrait print in a handcrafted wooden frame with 2mm glass protection.', price: 35000, category: 'frame', inStock: true, featured: false, rating: 4 },
  { id: '6', name: 'Mini Portrait Print', slug: 'mini-portrait-print', description: 'A5 pencil portrait perfect as a keepsake or gift insert.', price: 7500, category: 'print', inStock: false, featured: false, rating: 4 },
]

export const mockOrders: Order[] = [
  { id: '1', orderNumber: 'BEA-2024-001', userId: 'u1', customerName: 'Adaeze Okafor', customerEmail: 'adaeze@example.com', service: 'portrait', tier: 'portrait', size: 'A3', medium: 'charcoal', subjects: 1, background: 'Simple', notes: 'Please capture her smile.', referenceImages: [], price: 45000, status: 'completed', paymentStatus: 'paid', progressImages: [], createdAt: '2024-11-01', updatedAt: '2024-11-14', estimatedDelivery: '2024-11-15' },
  { id: '2', orderNumber: 'BEA-2024-002', userId: 'u2', customerName: 'Kofi Mensah', customerEmail: 'kofi@example.com', service: 'portrait', tier: 'legacy', size: 'A2', medium: 'pencil', subjects: 4, background: 'Detailed indoor scene', notes: '', referenceImages: [], price: 80000, status: 'in_progress', paymentStatus: 'paid', progressImages: [], createdAt: '2024-11-10', updatedAt: '2024-11-12', estimatedDelivery: '2024-11-24' },
  { id: '3', orderNumber: 'BEA-2024-003', userId: 'u3', customerName: 'Sarah Mitchell', customerEmail: 'sarah@example.com', service: 'portrait', tier: 'sketch', size: 'A4', medium: 'pencil', subjects: 1, background: 'None', notes: 'Wedding anniversary gift.', referenceImages: [], price: 25000, status: 'pending', paymentStatus: 'pending_verification', progressImages: [], createdAt: '2024-11-15', updatedAt: '2024-11-15', estimatedDelivery: '2024-11-29' },
  { id: '4', orderNumber: 'BEA-2024-004', userId: 'u4', customerName: 'Emeka Nwachukwu', customerEmail: 'emeka@example.com', service: 'enlargement', tier: 'sketch', size: 'A2', medium: 'pencil', subjects: 0, background: '', notes: 'Enlargement of grandma photo.', referenceImages: [], price: 15000, status: 'confirmed', paymentStatus: 'paid', progressImages: [], createdAt: '2024-11-13', updatedAt: '2024-11-13', estimatedDelivery: '2024-11-20' },
  { id: '5', orderNumber: 'BEA-2024-005', userId: 'u5', customerName: 'Chioma Eze', customerEmail: 'chioma@example.com', service: 'portrait', tier: 'portrait', size: 'A3', medium: 'charcoal', subjects: 2, background: 'Outdoor', notes: '', referenceImages: [], price: 45000, status: 'review', paymentStatus: 'paid', progressImages: [], createdAt: '2024-11-08', updatedAt: '2024-11-17', estimatedDelivery: '2024-11-22' },
]

export const mockPayments: Payment[] = [
  { id: 'p1', orderId: '3', orderNumber: 'BEA-2024-003', customerName: 'Sarah Mitchell', amount: 25000, proofImage: '', status: 'pending', submittedAt: '2024-11-15' },
  { id: 'p2', orderId: '2', orderNumber: 'BEA-2024-002', customerName: 'Kofi Mensah', amount: 80000, proofImage: '', status: 'verified', submittedAt: '2024-11-10', verifiedAt: '2024-11-11' },
  { id: 'p3', orderId: '1', orderNumber: 'BEA-2024-001', customerName: 'Adaeze Okafor', amount: 45000, proofImage: '', status: 'verified', submittedAt: '2024-11-01', verifiedAt: '2024-11-02' },
]

export const mockTestimonials: Testimonial[] = [
  { id: 't1', name: 'Adaeze Okafor', location: 'Lagos, Nigeria', rating: 5, text: 'The portrait Big Ed drew of my late mother brought me to tears. Every detail was perfect.' },
  { id: 't2', name: 'Sarah Mitchell', location: 'London, UK', rating: 5, text: 'Ordered a wedding portrait as an anniversary gift. He could not believe it was not a photograph.' },
  { id: 't3', name: 'Kofi Mensah', location: 'Accra, Ghana', rating: 5, text: "I've commissioned three portraits now. Each one is better than the last." },
  { id: 't4', name: 'Fatima Al-Hassan', location: 'Abuja, Nigeria', rating: 5, text: 'Received my family portrait within the promised timeframe. The packaging was perfect.' },
  { id: 't5', name: 'Marcus Johnson', location: 'Atlanta, USA', rating: 5, text: 'Big Ed handled the commission with sensitivity and skill. The result was deeply moving.' },
]

export const mockDashboardStats: DashboardStats = {
  totalOrders: 48, pendingOrders: 7, completedOrders: 38,
  totalRevenue: 2340000, pendingPayments: 3, totalCustomers: 41,
}
