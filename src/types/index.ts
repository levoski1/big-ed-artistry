// types/index.ts — Shared type definitions for Big Ed Artistry

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role?: 'customer' | 'admin'
  address?: string
  location?: string
  avatar?: string
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  customerName: string
  customerEmail: string
  service: string
  tier: string
  size: string
  medium: string
  subjects: number
  background: string
  notes: string
  referenceImages: string[]
  price: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  paymentStatus: 'NOT_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID' | 'paid' | 'pending_verification' | 'unpaid'
  progressImages: string[]
  createdAt: string
  updatedAt: string
  estimatedDelivery: string
}

export interface Artwork {
  id: string
  title: string
  medium: string
  size: string
  year: number
  image: string
  category: string
  featured: boolean
  description?: string
}

export interface Payment {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  amount: number
  proofImage: string
  status: 'pending' | 'verified' | 'rejected'
  submittedAt: string
  verifiedAt?: string
}

export interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
}

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  pendingPayments: number
  totalCustomers: number
}

export interface NavLink {
  label: string
  href: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
