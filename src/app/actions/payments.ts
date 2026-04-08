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
  const { data, error } = await admin
    .from('payments')
    .select('*, profiles(full_name, email), orders(order_number)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}
