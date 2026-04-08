"use server"

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

export async function createOrder(
  order: Omit<OrderInsert, 'order_number' | 'user_id'>,
  items: Omit<OrderItemInsert, 'order_id'>[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate order number via DB function
  const { data: numData, error: numError } = await supabase
    .rpc('generate_order_number')
  if (numError) throw new Error(numError.message)

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert({ ...order, user_id: user.id, order_number: numData as string })
    .select()
    .single()
  if (orderError) throw new Error(orderError.message)

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items.map(item => ({ ...item, order_id: newOrder.id })))
  if (itemsError) throw new Error(itemsError.message)

  return newOrder
}

export async function getMyOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getAllOrders() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email, phone), order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function updateOrderStatus(
  id: string,
  status: Database['public']['Tables']['orders']['Update']['status']
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
