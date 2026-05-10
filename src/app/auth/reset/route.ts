import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getAppUrl } from '@/lib/appUrl'

/**
 * Handles the Supabase recovery link redirect.
 *
 * Supabase supports two flows:
 *   1. PKCE (modern default):  /auth/reset?code=xxx
 *   2. token_hash (legacy):     /auth/reset?token_hash=xxx&type=recovery
 *
 * In either case we exchange the credential for a session cookie then
 * redirect to /reset-password so the user can enter a new password.
 * On failure we redirect to /forgot-password?error=1.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const baseUrl = getAppUrl() || new URL(request.url).origin
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  function makeClient() {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
          },
        },
      }
    )
  }

  // 1. PKCE flow (modern Supabase default)
  if (code) {
    const supabase = makeClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}/reset-password`)
    }
    return NextResponse.redirect(`${baseUrl}/forgot-password?error=1`)
  }

  // 2. token_hash flow (legacy)
  if (token_hash && type === 'recovery') {
    const supabase = makeClient()
    const { error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash,
    })
    if (!error) {
      return NextResponse.redirect(`${baseUrl}/reset-password`)
    }
  }

  // 3. Invalid or expired token — send back to request a new link
  return NextResponse.redirect(`${baseUrl}/forgot-password?error=1`)
}
