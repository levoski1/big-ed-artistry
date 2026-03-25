// hooks/index.ts — React hook stubs
// Wire these up to your real services once backend is ready

'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Order, User } from '@/types'
import type { StoreProduct } from '@/context/CartContext'
import { mockOrders, mockProducts } from '@/lib/mockData'

// ─── useAuth ──────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockUser: User = {
      id: 'u1',
      name: 'Adaeze Okafor',
      email: 'adaeze@example.com',
      phone: '+2348000000000',
      role: 'customer',
      createdAt: '2024-11-01',
    }
    setUser(mockUser)
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, _password: string) => {
    console.log('Login:', email)
  }, [])

  const logout = useCallback(async () => { setUser(null) }, [])

  return { user, loading, login, logout, isAdmin: user?.role === 'admin' }
}

// ─── useOrders ────────────────────────────────────────────────────────────
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      await new Promise(r => setTimeout(r, 300))
      setOrders(mockOrders)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const createOrder = useCallback(async (data: Partial<Order>) => {
    console.log('Creating order:', data)
    await fetchOrders()
  }, [fetchOrders])

  const updateStatus = useCallback(async (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }, [])

  return { orders, loading, error, createOrder, updateStatus, refetch: fetchOrders }
}

// ─── useProducts ──────────────────────────────────────────────────────────
export function useProducts() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => { setProducts(mockProducts); setLoading(false) }, 200)
  }, [])

  return { products, loading }
}

// ─── useModal ─────────────────────────────────────────────────────────────
export function useModal<T = undefined>() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<T | undefined>(undefined)

  const open = useCallback((d?: T) => { setData(d); setIsOpen(true) }, [])
  const close = useCallback(() => { setIsOpen(false) }, [])
  const toggle = useCallback(() => setIsOpen(p => !p), [])

  return { isOpen, data, open, close, toggle }
}

// ─── useUpload ────────────────────────────────────────────────────────────
export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(async (file: File) => {
    try {
      setUploading(true)
      setProgress(0)
      setError(null)
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 100))
        setProgress(i)
      }
      setUrl(`/uploads/${file.name}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [])

  const reset = useCallback(() => { setUrl(null); setProgress(0); setError(null) }, [])

  return { upload, uploading, progress, url, error, reset }
}
