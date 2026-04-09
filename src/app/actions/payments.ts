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
  if (error) throw new Error(error.message)
  return payment
}

export async function verifyPayment(paymentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('payments')
    .update({ status: 'verified', verified_by: user.id, verified_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select()
    .single()
  if (error) throw new Error(error.message)
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
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const { data: profiles } = await admin.from('profiles').select('id, full_name, email')
  const { data: orders } = await admin.from('orders').select('id, order_number')

  return (payments ?? []).map(p => ({
    ...p,
    profiles: (profiles ?? []).find(pr => pr.id === p.user_id) ?? null,
    orders: (orders ?? []).find(o => o.id === p.order_id) ?? null,
  }))
}
