"use server"

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { toUserMessage, ERR } from '@/lib/errorMessages'

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
  try {
    const admin = createAdminClient()
    const { data: profiles, error } = await admin
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .not('email', 'like', 'deleted-%@removed')
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
  } catch (e) {
    console.error('[getAllCustomers]', e instanceof Error ? e.message : e)
    throw new Error(ERR.LOAD_FAILED)
  }
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
  try {
    const { data, error } = await admin
      .from('orders')
      .update(updates as any)
      .eq('id', orderId)
      .select()
      .single()
    if (error) throw new Error(error.message)

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/orders')
    revalidatePath('/dashboard/payments')
    revalidatePath('/admin/orders')
    revalidatePath('/admin/payments')
    revalidatePath('/admin/dashboard')

    return data
  } catch (e) {
    console.error('[updateOrderPaymentStatus]', e instanceof Error ? e.message : e)
    throw new Error(ERR.UPDATE_FAILED)
  }
}

const BUCKET_MAP: Record<string, string> = {
  artwork_reference: 'artwork-references',
  payment_receipt: 'payment-receipts',
}

async function deleteUserStorageFiles(admin: ReturnType<typeof createAdminClient>, userId: string) {
  const { data: uploads } = await admin
    .from('uploads')
    .select('storage_path, file_type')
    .eq('user_id', userId)
  if (!uploads || uploads.length === 0) return

  const bucketGroups: Record<string, string[]> = {}
  for (const u of uploads) {
    const bucket = BUCKET_MAP[u.file_type]
    if (!bucket) continue
    if (!bucketGroups[bucket]) bucketGroups[bucket] = []
    bucketGroups[bucket].push(u.storage_path)
  }

  for (const [bucket, paths] of Object.entries(bucketGroups)) {
    const { error } = await admin.storage.from(bucket).remove(paths)
    if (error) console.error(`[deleteUser] Storage cleanup failed for bucket ${bucket}:`, error.message)
  }
}

export async function deleteUser(
  userId: string,
  mode: 'user_only' | 'full' = 'user_only'
): Promise<{ error: string } | { success: true }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: ERR.NOT_AUTHENTICATED }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (callerProfile?.role !== 'admin') return { error: ERR.PERMISSION_DENIED }
    if (userId === user.id) return { error: 'You cannot delete your own account.' }

    const admin = createAdminClient()

    if (mode === 'full') {
      await deleteUserStorageFiles(admin, userId)

      const { error: uploadsError } = await admin.from('uploads').delete().eq('user_id', userId)
      if (uploadsError) console.error('[deleteUser] uploads deletion:', uploadsError.message)

      const { error: reviewsError } = await admin.from('reviews').delete().eq('user_id', userId)
      if (reviewsError) console.error('[deleteUser] reviews deletion:', reviewsError.message)

      const { error: prefsError } = await admin.from('notification_preferences').delete().eq('user_id', userId)
      if (prefsError) console.error('[deleteUser] notification_preferences deletion:', prefsError.message)

      const { data: userOrders } = await admin.from('orders').select('id').eq('user_id', userId)
      const orderIds = (userOrders ?? []).map(o => o.id)

      if (orderIds.length > 0) {
        const { error: paymentsError } = await admin.from('payments').delete().in('order_id', orderIds)
        if (paymentsError) console.error('[deleteUser] payments deletion:', paymentsError.message)

        const { error: itemsError } = await admin.from('order_items').delete().in('order_id', orderIds)
        if (itemsError) console.error('[deleteUser] order_items deletion:', itemsError.message)

        const { error: ordersError } = await admin.from('orders').delete().in('id', orderIds)
        if (ordersError) console.error('[deleteUser] orders deletion:', ordersError.message)
      }

      const { error: profileError } = await admin.from('profiles').delete().eq('id', userId)
      if (profileError) throw new Error(profileError.message)

      const { error: authError } = await admin.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('[deleteUser] Auth deletion failed (records cleaned):', authError.message)
      }
    } else {
      const { error: updateError } = await admin
        .from('profiles')
        .update({
          email: `deleted-${userId.slice(0, 8)}@removed`,
          full_name: 'Deleted User',
          phone: null,
        })
        .eq('id', userId)
      if (updateError) throw new Error(updateError.message)

      const { error: authError } = await admin.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('[deleteUser] Auth deletion failed (profile anonymized):', authError.message)
      }
    }

    revalidatePath('/admin/customers')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (e) {
    console.error('[deleteUser]', e instanceof Error ? e.message : e)
    return { error: toUserMessage(e, 'Failed to delete user. Please try again.') }
  }
}
