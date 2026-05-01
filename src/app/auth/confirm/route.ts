import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'magiclink',
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(`${origin}/login?confirmed=1`)
    }

    const isExpired = error.message.toLowerCase().includes('expired') || error.code === 'otp_expired'
    return NextResponse.redirect(
      `${origin}/login?error=${isExpired ? 'link_expired' : 'invalid_token'}`
    )
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_token`)
}
