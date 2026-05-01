"use server"

import { createClient } from '@/lib/supabase/server'
import { ERR } from '@/lib/errorMessages'
import type { Database, UploadType } from '@/lib/types/database'

const BUCKET_MAP: Record<UploadType, string> = {
  artwork_reference: 'artwork-references',
  payment_receipt: 'payment-receipts',
}

type UploadRow = Database['public']['Tables']['uploads']['Row']

export async function uploadFile(
  formData: FormData,
  fileType: UploadType,
  orderItemId?: string
): Promise<UploadRow> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file) throw new Error(ERR.UPLOAD_NO_FILE)

  const bucket = BUCKET_MAP[fileType]
  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${Date.now()}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { upsert: false })
  if (uploadError) {
    console.error('[uploadFile storage error]', uploadError.message)
    throw new Error(ERR.UPLOAD_FAILED)
  }

  // Get signed URL (valid 1 year)
  const { data: urlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365)
  if (!urlData?.signedUrl) throw new Error(ERR.UPLOAD_URL_FAILED)

  // Record in uploads table
  const { data: upload, error: dbError } = await supabase
    .from('uploads')
    .insert({
      user_id: user.id,
      order_item_id: orderItemId ?? null,
      file_name: file.name,
      storage_path: storagePath,
      file_url: urlData.signedUrl,
      file_type: fileType,
      file_size: file.size,
    })
    .select()
    .single()
  if (dbError) {
    console.error('[uploadFile db error]', dbError.message, dbError.details, dbError.hint)
    throw new Error(ERR.UPLOAD_FAILED)
  }

  return upload
}

export async function uploadPaymentReceipt(formData: FormData) {
  return uploadFile(formData, 'payment_receipt')
}

export async function uploadArtworkReference(formData: FormData, orderItemId?: string) {
  return uploadFile(formData, 'artwork_reference', orderItemId)
}

export async function getMyUploads() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return []
  return data as UploadRow[]
}

export async function getUploadsByOrder(orderId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .order('created_at', { ascending: false })
  if (error) return []
  // Filter by order_item_id linkage or return all user uploads for now
  return (data ?? []) as UploadRow[]
}

export async function getAdminUploadsForOrder(orderId: string) {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const admin = createAdminClient()
  // Get order items for this order
  const { data: items } = await admin
    .from('order_items')
    .select('id')
    .eq('order_id', orderId)
  const itemIds = (items ?? []).map(i => i.id)

  // Get uploads linked to those items
  const { data: linked } = itemIds.length > 0
    ? await admin.from('uploads').select('*').in('order_item_id', itemIds).order('created_at', { ascending: false })
    : { data: [] }

  // Also get payment receipts for this order via payments table
  const { data: payments } = await admin
    .from('payments')
    .select('receipt_url, payment_type, amount, status, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  return {
    artworkRefs: (linked ?? []) as UploadRow[],
    paymentReceipts: (payments ?? []),
  }
}
