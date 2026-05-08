"use server"

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendOrderConfirmation, sendAdminNewOrder } from '@/lib/emailService'
import { toUserMessage, ERR } from '@/lib/errorMessages'
import type { Database } from '@/lib/types/database'

type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']

type OrderRow = Database['public']['Tables']['orders']['Row']

export async function createOrder(
  order: Omit<OrderInsert, 'order_number' | 'user_id' | 'amount_paid'>,
  items: Omit<OrderItemInsert, 'order_id'>[],
  amountPaid = 0,
  paymentType: 'full' | 'partial' = 'full',
  discount?: { originalSubtotal: number; amount: number; label: string }
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

    // Send notification emails (non-blocking — don't fail the order if email fails)
    const firstItem = items[0]
    const service = firstItem?.artwork_type === 'photo_enlargement'
      ? 'Photo Enlargement'
      : firstItem?.item_type === 'store_product'
        ? 'Store Product'
        : 'Custom Artwork'

    const amountPaidForEmail = amountPaid
    const isPartial = paymentType === 'partial'
    const emailItems = items.map(i => ({
      label: i.size_label
        ? `${i.artwork_type === 'photo_enlargement' ? 'Photo Enlargement' : 'Custom Artwork'} — ${i.size_label}`
        : i.product_id
          ? `Store Product × ${i.quantity}`
          : 'Artwork',
      price: i.item_subtotal,
    }))

    const emailData = {
      name: user.user_metadata?.full_name ?? user.email ?? 'Customer',
      orderNumber: newOrder.order_number,
      service,
      size: firstItem?.size_label ?? '—',
      medium: firstItem?.canvas_option ?? '—',
      subtotal: discount?.originalSubtotal,
      discountAmount: discount?.amount,
      discountLabel: discount?.label,
      total: newOrder.total_amount,
      amountPaid: amountPaidForEmail,
      isPartial,
      balanceDue: isPartial ? newOrder.total_amount - amountPaidForEmail : undefined,
      estimatedDelivery: '1–3 weeks',
      items: emailItems,
    }

    await Promise.allSettled([
      sendOrderConfirmation(user.email!, emailData),
      sendAdminNewOrder({
        customerName: emailData.name,
        customerEmail: user.email!,
        orderNumber: newOrder.order_number,
        service,
        total: newOrder.total_amount,
      }),
    ])

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard/payments')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/orders')

    return newOrder
  } catch (e) {
    console.error('[createOrder error]', e instanceof Error ? e.message : e)
    throw new Error(toUserMessage(e))
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
  if (error) throw new Error(ERR.GENERIC)

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
  if (error) throw new Error(ERR.GENERIC)

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
  if (error) throw new Error(ERR.GENERIC)

  // Send notification email to user
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', data.user_id)
    .single()

  if (profile?.email) {
    const { sendOrderStatusUpdate } = await import('@/lib/emailService')
    await sendOrderStatusUpdate(profile.email, {
      name: profile.full_name ?? profile.email,
      orderNumber: data.order_number,
      status: status ?? 'pending',
    }).catch(err => console.error('[updateOrderStatus] Email failed:', err))
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/orders')
  revalidatePath('/admin/orders')
  revalidatePath('/admin/dashboard')

  return data
}
