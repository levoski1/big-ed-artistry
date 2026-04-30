"use server"

import { createAdminClient } from '@/lib/supabase/server'

export async function getAdminStats() {
  const admin = createAdminClient()

  const [ordersRes, customersRes, paymentsRes, productsRes] = await Promise.all([
    admin.from('orders').select('id, total_amount, amount_paid, status, payment_status, created_at'),
    admin.from('profiles').select('id, role, created_at').eq('role', 'customer'),
    admin.from('payments').select('id, amount, status, created_at'),
    admin.from('products').select('id, in_stock'),
  ])

  const orders = ordersRes.data ?? []
  const customers = customersRes.data ?? []
  const payments = paymentsRes.data ?? []
  const products = productsRes.data ?? []

  const totalRevenue = orders.reduce((s, o) => s + (o.amount_paid ?? 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const inProgressOrders = orders.filter(o => o.status === 'in_progress').length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const pendingPayments = payments.filter(p => p.status === 'pending').length

  return {
    totalOrders: orders.length,
    totalRevenue,
    totalCustomers: customers.length,
    pendingOrders,
    inProgressOrders,
    completedOrders,
    pendingPayments,
    totalProducts: products.length,
    inStockProducts: products.filter(p => p.in_stock).length,
  }
}

export async function getAllCustomers() {
  const admin = createAdminClient()
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  // Fetch orders separately and attach
  const { data: orders } = await admin
    .from('orders')
    .select('id, user_id, order_number, total_amount, amount_paid, status, payment_status, created_at')
    .order('created_at', { ascending: false })

  return (profiles ?? []).map(p => ({
    ...p,
    orders: (orders ?? []).filter(o => o.user_id === p.id),
  }))
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'NOT_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID',
  amountPaid?: number
) {
  const admin = createAdminClient()
  const updates = {
    payment_status: paymentStatus,
    ...(amountPaid !== undefined ? { amount_paid: amountPaid } : {}),
  }
  const { data, error } = await admin
    .from('orders')
    .update(updates as any)
    .eq('id', orderId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
