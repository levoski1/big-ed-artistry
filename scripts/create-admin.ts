/**
 * Creates the admin account for Big Ed Artistry.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Requires these env vars (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL      (set in .env.local)
 *   ADMIN_PASSWORD   (set in .env.local)
 *   ADMIN_FULL_NAME  (optional, defaults to "Big Ed")
 */

// # 1. Push the gallery migration
// npx supabase db push

// # 2. Create the gallery-images storage bucket in Supabase Dashboard
// #    → Storage → New bucket → "gallery-images" → Public

// # 3. Create the admin account
// npm run admin:create


import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ADMIN_EMAIL       = process.env.ADMIN_EMAIL!
const ADMIN_PASSWORD    = process.env.ADMIN_PASSWORD!
const ADMIN_FULL_NAME   = process.env.ADMIN_FULL_NAME ?? 'Big Ed'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing required env vars. Add to .env.local:')
  console.error('  ADMIN_EMAIL=your@email.com')
  console.error('  ADMIN_PASSWORD=yourpassword')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  console.log(`Creating admin account for ${ADMIN_EMAIL}...`)

  // Check if user already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', ADMIN_EMAIL)
    .single()

  if (existing) {
    if (existing.role === 'admin') {
      console.log('✓ Admin account already exists.')
      process.exit(0)
    }
    // Exists but not admin — promote
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin', full_name: ADMIN_FULL_NAME })
      .eq('id', existing.id)
    if (error) { console.error('Failed to promote user:', error.message); process.exit(1) }
    console.log('✓ Existing user promoted to admin.')
    process.exit(0)
  }

  // Create new auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: ADMIN_FULL_NAME },
  })

  if (authError) {
    console.error('Failed to create auth user:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id

  // Set role to admin in profiles (trigger creates the row, we update it)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', full_name: ADMIN_FULL_NAME })
    .eq('id', userId)

  if (profileError) {
    console.error('Failed to set admin role:', profileError.message)
    process.exit(1)
  }

  console.log('✓ Admin account created successfully.')
  console.log(`  Email:    ${ADMIN_EMAIL}`)
  console.log(`  Name:     ${ADMIN_FULL_NAME}`)
  console.log(`  User ID:  ${userId}`)
}

main()
