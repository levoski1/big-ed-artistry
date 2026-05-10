"use server"

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database'

type GalleryRow = Database['public']['Tables']['gallery_items']['Row']
type GalleryInsert = Database['public']['Tables']['gallery_items']['Insert']
type GalleryUpdate = Database['public']['Tables']['gallery_items']['Update']

export type GalleryItem = GalleryRow

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function getGalleryItems(options?: { category?: string; featured?: boolean; limit?: number }) {
  const supabase = await createClient()
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.category) query = query.eq('category', options.category)
  if (options?.featured !== undefined) query = query.eq('featured', options.featured)
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as GalleryItem[]
}

export async function createGalleryItem(formData: FormData) {
  const admin = createAdminClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file) throw new Error('No image provided')

  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Unsupported file type. Please upload a JPG, PNG, or WebP image.')
  }
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Please upload a JPG, PNG, or WebP image.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large. Maximum size is 10MB.')
  }

  const storagePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('gallery-images')
    .upload(storagePath, file, { upsert: false })
  if (uploadError) {
    console.error('[createGalleryItem] storage upload failed:', uploadError.message)
    throw new Error('File upload failed. Please try a smaller image (JPG/PNG under 10MB).')
  }

  const { data: urlData } = admin.storage
    .from('gallery-images')
    .getPublicUrl(storagePath)

  // Parse metadata from a FormData field (encoded as JSON string)
  let meta: {
    title: string
    medium?: string
    size?: string | null
    year?: number
    category?: string
    description?: string | null
    featured?: boolean
  } = { title: '' }
  try {
    const raw = formData.get('meta')
    if (typeof raw === 'string') meta = JSON.parse(raw)
  } catch {
    console.error('[createGalleryItem] failed to parse meta JSON')
    throw new Error('Invalid metadata.')
  }
  if (!meta.title) throw new Error('Title is required.')
  if (!meta.category) throw new Error('Category is required.')

  const insert: GalleryInsert = {
    title: meta.title,
    medium: meta.medium ?? 'Pencil on Paper',
    size: meta.size ?? null,
    year: meta.year ?? new Date().getFullYear(),
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
  if (error) {
    console.error('[createGalleryItem] db insert failed:', error.message)
    // Clean up the uploaded file if the DB insert fails
    await admin.storage.from('gallery-images').remove([storagePath]).catch(() => {})
    throw new Error('Failed to save gallery item. Please try again.')
  }
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
