"use server"

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emailService'
import { confirmationTemplate } from '@/lib/emailTemplates'

function friendlyAuthError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (
    msg.includes('fetch failed') ||
    msg.includes('Connect Timeout') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('network') ||
    msg.includes('UND_ERR')
  ) {
    return 'Unable to connect. Please check your internet connection and try again.'
  }
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.'
  if (msg.includes('Email not confirmed')) return 'Please confirm your email before signing in.'
  if (msg.includes('User already registered')) return 'An account with this email already exists.'
  if (msg.includes('Password should be')) return 'Password must be at least 8 characters.'
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Too many attempts. Please wait a moment and try again.'
  return msg || 'Something went wrong. Please try again.'
}

export async function register(data: {
  email: string
  password: string
  full_name: string
  phone?: string
}) {
  try {
    const admin = createAdminClient()

    // Use admin.createUser with email_confirm=false to suppress Supabase's
    // built-in confirmation email — we send our own branded one below.
    const { data: result, error } = await admin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: false,
      user_metadata: { full_name: data.full_name, phone: data.phone ?? null },
    })
    if (error) throw new Error(friendlyAuthError(error))

    if (result.user) {
      // Create profile row immediately so FK constraints work
      await admin.from('profiles').upsert({
        id: result.user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone ?? null,
      }, { onConflict: 'id' })

      // Generate a confirmation link pointing to our /auth/confirm route
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'signup',
        email: data.email,
        password: data.password,
        options: { redirectTo: `${siteUrl}/auth/confirm` },
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error('[register] generateLink failed:', linkError?.message)
        throw new Error('Failed to generate confirmation link. Please try again.')
      }

      const emailResult = await sendEmail({
        to: data.email,
        subject: 'Confirm your Big Ed Artistry account',
        html: confirmationTemplate({
          name: data.full_name,
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
    throw new Error(friendlyAuthError(e))
  }
}

export async function resendConfirmation(email: string) {
  try {
    const admin = createAdminClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // Look up the user to get their name for the email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw new Error(friendlyAuthError(listError))
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
    throw new Error(friendlyAuthError(e))
  }
}

export async function login(email: string, password: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(friendlyAuthError(error))
    return data
  } catch (e) {
    throw new Error(friendlyAuthError(e))
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

  if (error) throw new Error(error.message)
  return profile
}
