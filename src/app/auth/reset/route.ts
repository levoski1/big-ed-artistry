import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/appUrl'

/**
 * Handles the Supabase recovery link redirect.
 * Supabase sends the user here with ?token_hash=...&type=recovery
 * We exchange the token for a session, then redirect to /reset-password.
 * On failure we redirect to /forgot-password?error=1 so the user can request a new link.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const baseUrl = getAppUrl() || new URL(request.url).origin
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type === 'recovery') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash,
    })

    if (!error) {
      // Session is now set in the cookie — redirect to the password form
      return NextResponse.redirect(`${baseUrl}/reset-password`)
    }
  }

  // Invalid or expired token
  return NextResponse.redirect(`${baseUrl}/forgot-password?error=1`)
}
