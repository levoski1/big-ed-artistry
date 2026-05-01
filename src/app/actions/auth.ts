"use server"

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emailService'
import { confirmationTemplate } from '@/lib/emailTemplates'
import { checkRateLimit } from '@/lib/rateLimit'
import { validateEmail, validatePassword, validateName } from '@/lib/sanitize'
import { toUserMessage, ERR } from '@/lib/errorMessages'

function getClientIp(): string {
  const hdrs = headers()
  return (
    hdrs.get('x-forwarded-for')?.split(',')[0].trim() ??
    hdrs.get('x-real-ip') ??
    'unknown'
  )
}

export async function register(data: {
  email: string
  password: string
  full_name: string
  phone?: string
}) {
  try {
    // Rate limit: 5 registrations per hour per IP
    const ip = getClientIp()
    const rl = checkRateLimit(`register:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.allowed) throw new Error('Too many attempts. Please wait a moment and try again.')

    // Validate inputs
    const cleanEmail = validateEmail(data.email)
    if (!cleanEmail) throw new Error('Invalid email address.')
    const cleanPassword = validatePassword(data.password)
    if (!cleanPassword) throw new Error('Password must be at least 8 characters.')
    const cleanName = validateName(data.full_name)
    if (!cleanName) throw new Error('Please enter a valid name.')

    const admin = createAdminClient()

    // Use admin.createUser with email_confirm=false to suppress Supabase's
    // built-in confirmation email — we send our own branded one below.
    const { data: result, error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: false,
      user_metadata: { full_name: cleanName, phone: data.phone ?? null },
    })
    if (error) throw new Error(toUserMessage(error))

    if (result.user) {
      // Create profile row immediately so FK constraints work
      await admin.from('profiles').upsert({
        id: result.user.id,
        email: cleanEmail,
        full_name: cleanName,
        phone: data.phone ?? null,
      }, { onConflict: 'id' })

      // Generate a confirmation link pointing to our /auth/confirm route
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'signup',
        email: cleanEmail,
        password: cleanPassword,
        options: { redirectTo: `${siteUrl}/auth/confirm` },
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error('[register] generateLink failed:', linkError?.message)
        throw new Error('Failed to generate confirmation link. Please try again.')
      }

      const emailResult = await sendEmail({
        to: cleanEmail,
        subject: 'Confirm your Big Ed Artistry account',
        html: confirmationTemplate({
          name: cleanName,
          confirmUrl: linkData.properties.action_link,
        }),
      })

      if (!emailResult.success) {
        console.error('[register] sendEmail failed:', emailResult.error)
        throw new Error('Account created but confirmation email failed to send. Contact support.')
      }
    }

    return result
  } catch (e) {
    throw new Error(toUserMessage(e))
  }
}

export async function resendConfirmation(email: string) {
  try {
    const admin = createAdminClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Look up the user to get their name for the email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw new Error(toUserMessage(listError))
    const user = users.find(u => u.email === email)
    if (!user) throw new Error('No account found with that email address.')
    if (user.email_confirmed_at) throw new Error('This email is already confirmed. Please sign in.')

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/auth/confirm` },
    })
    if (linkError || !linkData?.properties?.action_link) throw new Error('Failed to generate confirmation link.')

    const name = user.user_metadata?.full_name ?? email
    await sendEmail({
      to: email,
      subject: 'Confirm your Big Ed Artistry account',
      html: confirmationTemplate({ name, confirmUrl: linkData.properties.action_link }),
    })
  } catch (e) {
    throw new Error(toUserMessage(e))
  }
}

export async function login(email: string, password: string) {
  try {
    // Rate limit: 10 attempts per 15 minutes per IP
    const ip = getClientIp()
    const rl = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 })
    if (!rl.allowed) throw new Error('Too many attempts. Please wait a moment and try again.')

    // Validate inputs — reject obviously malformed values before hitting Supabase
    const cleanEmail = validateEmail(email)
    if (!cleanEmail) throw new Error('Incorrect email or password.')
    const cleanPassword = validatePassword(password)
    if (!cleanPassword) throw new Error('Incorrect email or password.')

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword })
    // Enumeration protection: always return the same generic message for auth failures
    if (error) throw new Error('Incorrect email or password.')
    return data
  } catch (e) {
    // Re-throw rate limit and network errors as-is; mask everything else
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Too many') || msg.includes('Unable to connect')) throw e
    throw new Error('Incorrect email or password.')
  }
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
  redirect('/')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist yet, create it from auth metadata
  if (!profile) {
    const admin = createAdminClient()
    const { data: newProfile } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
        phone: user.user_metadata?.phone ?? null,
      }, { onConflict: 'id' })
      .select()
      .single()
    return newProfile
  }

  return profile
}

export async function updateProfile(data: { full_name?: string; phone?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw new Error(ERR.PROFILE_UPDATE_FAILED)
  return profile
}
