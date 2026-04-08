"use server"

import { createClient } from '@/lib/supabase/server'
import type { UploadType } from '@/lib/types/database'

const BUCKET_MAP: Record<UploadType, string> = {
  artwork_reference: 'artwork-references',
  payment_receipt: 'payment-receipts',
}

export async function uploadFile(
  file: File,
  fileType: UploadType,
  orderItemId?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const bucket = BUCKET_MAP[fileType]
  const ext = file.name.split('.').pop()
  const storagePath = `${user.id}/${Date.now()}.${ext}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  // Get signed URL (valid 1 year)
  const { data: urlData } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365)
  if (!urlData?.signedUrl) throw new Error('Failed to generate signed URL')

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
  if (dbError) throw new Error(dbError.message)

  return upload
}

export async function uploadArtworkReference(file: File, orderItemId?: string) {
  return uploadFile(file, 'artwork_reference', orderItemId)
}

export async function uploadPaymentReceipt(file: File) {
  return uploadFile(file, 'payment_receipt')
}
