"use server"

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type GalleryRow = Database['public']['Tables']['gallery_items']['Row']
type GalleryInsert = Database['public']['Tables']['gallery_items']['Insert']
type GalleryUpdate = Database['public']['Tables']['gallery_items']['Update']

export type GalleryItem = GalleryRow

export async function getGalleryItems(options?: { category?: string; featured?: boolean }) {
  const supabase = await createClient()
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (options?.category) query = query.eq('category', options.category)
  if (options?.featured !== undefined) query = query.eq('featured', options.featured)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as GalleryItem[]
}

export async function createGalleryItem(
  formData: FormData,
  meta: { title: string; medium: string; size?: string; year: number; category: string; description?: string; featured?: boolean }
) {
  const admin = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file) throw new Error('No image provided')

  const ext = file.name.split('.').pop()
  const storagePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('gallery-images')
    .upload(storagePath, file, { upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const { data: urlData } = admin.storage
    .from('gallery-images')
    .getPublicUrl(storagePath)

  const insert: GalleryInsert = {
    title: meta.title,
    medium: meta.medium,
    size: meta.size ?? null,
    year: meta.year,
    category: meta.category,
    description: meta.description ?? null,
    featured: meta.featured ?? false,
    image_url: urlData.publicUrl,
    storage_path: storagePath,
  }

  const { data, error } = await admin
    .from('gallery_items')
    .insert(insert)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as GalleryItem
}

export async function updateGalleryItem(id: string, updates: GalleryUpdate) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as GalleryItem
}

export async function deleteGalleryItem(id: string) {
  const admin = createAdminClient()

  const { data: item } = await admin
    .from('gallery_items')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (item?.storage_path) {
    await admin.storage.from('gallery-images').remove([item.storage_path])
  }

  const { error } = await admin.from('gallery_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
