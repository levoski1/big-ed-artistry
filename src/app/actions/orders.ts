"use server"

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

function friendlyOrderError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  // Log the raw error server-side for debugging
  console.error('[createOrder error]', msg)
  if (msg.includes('fetch failed') || msg.includes('Connect Timeout') || msg.includes('UND_ERR') || msg.includes('ECONNREFUSED')) {
    return 'Unable to connect. Please check your internet connection and try again.'
  }
  if (msg === 'SESSION_EXPIRED' || msg.includes('Not authenticated') || msg.includes('JWT') || msg.includes('not authenticated')) {
    return 'SESSION_EXPIRED'
  }
  if (msg.includes('foreign key') || msg.includes('user_id_fkey') || msg.includes('violates foreign key')) {
    return 'SESSION_EXPIRED'
  }
  if (msg.includes('duplicate') || msg.includes('unique constraint')) {
    return 'It looks like this order was already submitted. Please check your orders page.'
  }
  if (msg.includes('storage') || msg.includes('upload') || msg.includes('bucket')) {
    return 'Receipt upload failed. Please try a smaller image (JPG/PNG under 5MB).'
  }
  if (msg.includes('row-level security') || msg.includes('permission denied') || msg.includes('policy')) {
    return 'Permission denied. Please sign in and try again.'
  }
  // Return the raw message so nothing is silently swallowed
  return msg
}

type OrderRow = Database['public']['Tables']['orders']['Row']

export async function createOrder(
  order: Omit<OrderInsert, 'order_number' | 'user_id'>,
  items: Omit<OrderItemInsert, 'order_id'>[]
): Promise<OrderRow> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Ensure profile row exists (safety net for users registered before the trigger was added)
    const admin = createAdminClient()
    await admin.from('profiles').upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? '',
      phone: user.user_metadata?.phone ?? null,
    }, { onConflict: 'id' })

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
  } catch (e) {
    throw new Error(friendlyOrderError(e))
  }
}

export async function getMyOrders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const orderIds = (orders ?? []).map(o => o.id)
  const { data: items } = orderIds.length > 0
    ? await supabase.from('order_items').select('*').in('order_id', orderIds)
    : { data: [] }

  return (orders ?? []).map(o => ({
    ...o,
    order_items: (items ?? []).filter(i => i.order_id === o.id),
  }))
}

export async function getAllOrders() {
  const admin = createAdminClient()
  const { data: orders, error } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  // Fetch profiles and items separately
  const { data: profiles } = await admin.from('profiles').select('id, full_name, email, phone')
  const { data: items } = await admin.from('order_items').select('*')

  return (orders ?? []).map(o => ({
    ...o,
    profiles: (profiles ?? []).find(p => p.id === o.user_id) ?? null,
    order_items: (items ?? []).filter(i => i.order_id === o.id),
  }))
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
