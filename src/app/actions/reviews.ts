"use server"

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type ReviewRow = Database['public']['Tables']['reviews']['Row']

export type Review = ReviewRow

export async function getReviews(): Promise<Review[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return []
    return (data ?? []) as Review[]
  } catch {
    return []
  }
}

export async function submitReview(message: string, rating: number): Promise<Review> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to leave a review.')

  // Fetch name from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const user_name = profile?.full_name || user.email?.split('@')[0] || 'Anonymous'

  const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: user.id, user_name, message, rating })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Review
}
