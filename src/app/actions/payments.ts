"use server"

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type PaymentInsert = Database['public']['Tables']['payments']['Insert']

export async function submitPayment(data: Omit<PaymentInsert, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()
  if (error) {
    console.error('[submitPayment error]', error.message, error.details, error.hint)
    throw new Error(error.message)
  }
  return payment
}

export async function verifyPayment(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  // Get the payment to know the order and amount
  const { data: payment, error: fetchError } = await admin
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  // Mark payment as verified
  const { data, error } = await admin
    .from('payments')
    .update({ status: 'verified', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single()
  if (error) throw new Error(error.message)

  // Update order's amount_paid and payment_status
  const { data: order } = await admin
    .from('orders')
    .select('total_amount, amount_paid')
    .eq('id', payment.order_id)
    .single()

  if (order) {
    const newAmountPaid = (order.amount_paid ?? 0) + payment.amount
    const newPaymentStatus = newAmountPaid >= order.total_amount ? 'FULLY_PAID' : 'PARTIALLY_PAID'
    await admin
      .from('orders')
      .update({ amount_paid: newAmountPaid, payment_status: newPaymentStatus })
      .eq('id', payment.order_id)
  }

  return data
}

export async function rejectPayment(paymentId: string, rejection_reason: string) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('payments')
    .update({ status: 'rejected', rejection_reason })
    .eq('id', paymentId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getAllPayments() {
  const admin = createAdminClient()
  const { data: payments, error } = await admin
    .from('payments')
    .select('*')
    .order('created_at', { ascending: true }) // ascending so 1st payment comes first
  if (error) throw new Error(error.message)

  const { data: profiles } = await admin.from('profiles').select('id, full_name, email')
  const { data: orders } = await admin
    .from('orders')
    .select('id, order_number, total_amount, amount_paid, amount_remaining, payment_status')

  return (payments ?? []).map(p => ({
    ...p,
    profiles: (profiles ?? []).find(pr => pr.id === p.user_id) ?? null,
    orders: (orders ?? []).find(o => o.id === p.order_id) ?? null,
  }))
}
