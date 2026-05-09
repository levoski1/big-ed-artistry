import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/appUrl'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const baseUrl = getAppUrl() || new URL(request.url).origin
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')

  const supabase = await createClient()

  // PKCE flow: Supabase redirects here with ?code= after verifying on their end
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseUrl}/login?confirmed=1`)
    }
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`)
  }

  // token_hash flow (from generateLink)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'magiclink',
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(`${baseUrl}/login?confirmed=1`)
    }

    const isExpired = error.code === 'otp_expired' || error.message.toLowerCase().includes('expired')
    return NextResponse.redirect(
      `${baseUrl}/login?error=${isExpired ? 'link_expired' : 'invalid_token'}`
    )
  }

  return NextResponse.redirect(`${baseUrl}/login?error=invalid_token`)
}
