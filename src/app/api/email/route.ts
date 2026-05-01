import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendEmail } from '@/lib/emailService'
import { checkRateLimit } from '@/lib/rateLimit'
import { validateEmail, validateSubject, validateHtml } from '@/lib/sanitize'

// 5 emails per 10 minutes per IP
const RATE_LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

async function getSession(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = getIp(req)
  const rl = checkRateLimit(`email:${ip}`, RATE_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    )
  }

  // 2. Require authenticated session
  const session = await getSession(req)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Parse and validate inputs
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { to, subject, html } = body as Record<string, unknown>

  const cleanTo = validateEmail(to)
  const cleanSubject = validateSubject(subject)
  const cleanHtml = validateHtml(html)

  if (!cleanTo || !cleanSubject || !cleanHtml) {
    return NextResponse.json(
      { error: 'Invalid input: to, subject, and html are required and must be valid.' },
      { status: 400 }
    )
  }

  // 4. Send
  try {
    const result = await sendEmail({ to: cleanTo, subject: cleanSubject, html: cleanHtml })
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
    }
    return NextResponse.json({ messageId: result.messageId }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
