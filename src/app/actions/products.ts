"use server"

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export async function getProducts(options?: { featured?: boolean; category?: string }) {
  const supabase = await createClient()
  let query = supabase.from('products').select('*').order('created_at', { ascending: false })

  if (options?.featured !== undefined) query = query.eq('featured', options.featured)
  if (options?.category) query = query.eq('category', options.category as ProductInsert['category'])

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(data: ProductInsert) {
  const supabase = createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return product
}

export async function updateProduct(id: string, data: ProductUpdate) {
  const supabase = createAdminClient()
  const { data: product, error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return product
}

export async function deleteProduct(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
