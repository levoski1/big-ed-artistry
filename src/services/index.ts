// services/index.ts — API service layer stubs
// Replace these with real fetch calls to your backend

import type { Order, User, Payment } from '@/types'
import type { StoreProduct } from '@/context/CartContext'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api'

// ─── Auth ────────────────────────────────────────────────────────────────
export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('Login failed')
    return res.json()
  },

  async register(data: { name: string; email: string; phone: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Registration failed')
    return res.json()
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' })
  },

  async me(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`)
    if (!res.ok) throw new Error('Not authenticated')
    return res.json()
  },
}

// ─── Orders ───────────────────────────────────────────────────────────────
export const orderService = {
  async getAll(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders`)
    if (!res.ok) throw new Error('Failed to fetch orders')
    return res.json()
  },

  async getById(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}`)
    if (!res.ok) throw new Error('Order not found')
    return res.json()
  },

  async create(data: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create order')
    return res.json()
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error('Failed to update order status')
    return res.json()
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/mine`)
    if (!res.ok) throw new Error('Failed to fetch your orders')
    return res.json()
  },
}

// ─── Products ─────────────────────────────────────────────────────────────
export const productService = {
  async getAll(): Promise<StoreProduct[]> {
    const res = await fetch(`${API_BASE}/products`)
    if (!res.ok) throw new Error('Failed to fetch products')
    return res.json()
  },

  async getBySlug(slug: string): Promise<StoreProduct> {
    const res = await fetch(`${API_BASE}/products/${slug}`)
    if (!res.ok) throw new Error('Product not found')
    return res.json()
  },

  async create(data: Partial<StoreProduct>): Promise<StoreProduct> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create product')
    return res.json()
  },

  async update(id: string, data: Partial<StoreProduct>): Promise<StoreProduct> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update product')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete product')
  },
}

// ─── Payments ─────────────────────────────────────────────────────────────
export const paymentService = {
  async getAll(): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments`)
    if (!res.ok) throw new Error('Failed to fetch payments')
    return res.json()
  },

  async uploadProof(orderId: string, file: File): Promise<Payment> {
    const form = new FormData()
    form.append('orderId', orderId)
    form.append('proof', file)
    const res = await fetch(`${API_BASE}/payments/upload`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Failed to upload payment proof')
    return res.json()
  },

  async verify(paymentId: string): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/verify`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to verify payment')
    return res.json()
  },

  async reject(paymentId: string, reason?: string): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    if (!res.ok) throw new Error('Failed to reject payment')
    return res.json()
  },
}

// ─── Upload ───────────────────────────────────────────────────────────────
export const uploadService = {
  async uploadImage(file: File, folder?: string): Promise<{ url: string; publicId: string }> {
    const form = new FormData()
    form.append('file', file)
    if (folder) form.append('folder', folder)
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form })
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  },
}
