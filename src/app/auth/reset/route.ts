import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles the Supabase recovery link redirect.
 * Supabase sends the user here with ?token_hash=...&type=recovery
 * We exchange the token for a session, then redirect to /reset-password.
 * On failure we redirect to /forgot-password?error=1 so the user can request a new link.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
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
      return NextResponse.redirect(`${origin}/reset-password`)
    }
  }

  // Invalid or expired token
  return NextResponse.redirect(`${origin}/forgot-password?error=1`)
}
