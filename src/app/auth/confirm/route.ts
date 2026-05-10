import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getAppUrl } from '@/lib/appUrl'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const baseUrl = getAppUrl() || new URL(request.url).origin
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

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

  // PKCE flow: Supabase redirects here with ?code= after verifying on their end
  if (code) {
    const supabase = makeClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}/login?confirmed=1`)
    }
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`)
  }

  // token_hash flow (legacy / SITE_URL-based redirect)
  if (token_hash && type) {
    const supabase = makeClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'magiclink',
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(`${baseUrl}/login?confirmed=1`)
    }

    const isExpired =
      error.code === 'otp_expired' ||
      error.message?.toLowerCase().includes('expired')

    if (isExpired) {
      return NextResponse.redirect(`${baseUrl}/login?error=link_expired`)
    }

    // The token wasn't clearly expired, but verifyOtp failed.
    // This typically happens when Supabase's hosted verification page
    // already consumed the token and the email IS confirmed.
    // Since we can't distinguish "already used" from "invalid" without
    // the user's email, redirect to a helpful state on the login page.
    return NextResponse.redirect(`${baseUrl}/login?error=verification_failed`)
  }

  return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`)
}
