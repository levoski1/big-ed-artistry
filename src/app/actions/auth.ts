"use server"

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/emailService'
import { confirmationTemplate, passwordResetTemplate } from '@/lib/emailTemplates'
import { checkRateLimit } from '@/lib/rateLimit'
import { validateEmail, validatePassword, validateName } from '@/lib/sanitize'
import { toUserMessage, ERR } from '@/lib/errorMessages'
import { getAppUrl } from '@/lib/appUrl'
import type { Database } from '@/lib/types/database'

function getClientIp(): string {
  try {
    const hdrs = headers()
    return (
      hdrs.get('x-forwarded-for')?.split(',')[0].trim() ??
      hdrs.get('x-real-ip') ??
      'unknown'
    )
  } catch {
    return 'unknown'
  }
}

export async function register(data: {
  email: string
  password: string
  full_name: string
  phone?: string
}): Promise<{ error: string } | { success: true }> {
  try {
    const ip = getClientIp()
    const rl = checkRateLimit(`register:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rl.allowed) return { error: ERR.RATE_LIMITED }

    const cleanEmail = validateEmail(data.email)
    if (!cleanEmail) return { error: ERR.INVALID_EMAIL }
    const cleanPassword = validatePassword(data.password)
    if (!cleanPassword) return { error: ERR.WEAK_PASSWORD }
    const cleanName = validateName(data.full_name)
    if (!cleanName) return { error: ERR.INVALID_NAME }

    const admin = createAdminClient()

    const { data: result, error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: false,
      user_metadata: { full_name: cleanName, phone: data.phone ?? null },
    })
    if (error) return { error: toUserMessage(error) }

    if (result.user) {
      await admin.from('profiles').upsert({
        id: result.user.id,
        email: cleanEmail,
        full_name: cleanName,
        phone: data.phone ?? null,
      }, { onConflict: 'id' })

      const siteUrl = getAppUrl()
      if (!siteUrl) {
        console.error('[register] APP_URL is not set in production.')
        return { error: ERR.CONFIRM_LINK_FAILED }
      }
      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: 'signup',
        email: cleanEmail,
        password: cleanPassword,
        options: { redirectTo: `${siteUrl}/auth/confirm` },
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error('[register] generateLink failed:', linkError?.message)
        return { error: ERR.CONFIRM_LINK_FAILED }
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
      }
    }

    return { success: true }
  } catch (e) {
    console.error('[register]', e)
    return { error: toUserMessage(e) }
  }
}

export async function resendConfirmation(email: string): Promise<{ error: string } | { success: true }> {
  try {
    const admin = createAdminClient()
    const siteUrl = getAppUrl()
    if (!siteUrl) {
      console.error('[resendConfirmation] APP_URL is not set in production.')
      return { error: ERR.CONFIRM_LINK_FAILED }
    }

    // Look up the user to get their name for the email
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) return { error: toUserMessage(listError) }
    const user = users.find(u => u.email === email)
    if (!user) return { error: ERR.GENERIC }
    if (user.email_confirmed_at) return { error: ERR.EMAIL_ALREADY_CONFIRMED }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${siteUrl}/auth/confirm` },
    })
    if (linkError || !linkData?.properties?.action_link) return { error: ERR.CONFIRM_LINK_FAILED }

    const name = user.user_metadata?.full_name ?? email
    await sendEmail({
      to: email,
      subject: 'Confirm your Big Ed Artistry account',
      html: confirmationTemplate({ name, confirmUrl: linkData.properties.action_link }),
    })
    return { success: true }
  } catch (e) {
    return { error: toUserMessage(e) }
  }
}

export async function login(email: string, password: string): Promise<{ error: string } | { success: true }> {
  try {
    const ip = getClientIp()
    const rl = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 })
    if (!rl.allowed) return { error: ERR.RATE_LIMITED }

    const cleanEmail = validateEmail(email)
    if (!cleanEmail) return { error: ERR.INVALID_CREDENTIALS }
    const cleanPassword = validatePassword(password)
    if (!cleanPassword) return { error: ERR.INVALID_CREDENTIALS }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword })

    if (error) {
      if (error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message)) {
        return { error: ERR.EMAIL_NOT_CONFIRMED }
      }
      return { error: ERR.INVALID_CREDENTIALS }
    }
    return { success: true }
  } catch (e) {
    console.error('[login]', e)
    return { error: ERR.INVALID_CREDENTIALS }
  }
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) console.error('[logout]', error.message)
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

export async function updateProfile(data: { full_name?: string; phone?: string }): Promise<{ error: string } | { profile: Database['public']['Tables']['profiles']['Row'] }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: ERR.NOT_AUTHENTICATED }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single()

    if (error) return { error: ERR.PROFILE_UPDATE_FAILED }
    return { profile }
  } catch (e) {
    console.error('[updateProfile]', e)
    return { error: ERR.GENERIC }
  }
}

/**
 * Sends a password reset email.
 * Always returns the same message regardless of whether the email exists
 * to prevent user enumeration.
 */
export async function forgotPassword(email: string): Promise<{ error: string } | { success: true }> {
  try {
    // Rate limit: 3 reset requests per 15 minutes per IP
    const ip = getClientIp()
    const rl = checkRateLimit(`reset:${ip}`, { limit: 3, windowMs: 15 * 60 * 1000 })
    if (!rl.allowed) return { error: ERR.RATE_LIMITED }

    const cleanEmail = validateEmail(email)
    // Always succeed silently for invalid/non-existent emails (no enumeration)
    if (!cleanEmail) return { success: true }

    const siteUrl = getAppUrl()
    if (!siteUrl) return { success: true }

    const admin = createAdminClient()

    // Generate a recovery link via Supabase admin API.
    // Supabase handles token generation, hashing, expiry (default 1h, we use 15m via
    // the redirectTo flow), and single-use enforcement.
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: cleanEmail,
      options: { redirectTo: `${siteUrl}/auth/reset` },
    })

    // If the email doesn't exist, generateLink returns an error — we swallow it silently.
    if (linkError || !linkData?.properties?.action_link) return { success: true }

    // Look up the user's name for a personalised email
    const { data: { users } } = await admin.auth.admin.listUsers()
    const user = users.find(u => u.email === cleanEmail)
    const name = user?.user_metadata?.full_name ?? cleanEmail

    await sendEmail({
      to: cleanEmail,
      subject: 'Reset your Big Ed Artistry password',
      html: passwordResetTemplate({ name, resetUrl: linkData.properties.action_link }),
    })
    return { success: true }
  } catch (e) {
    console.error('[forgotPassword]', e instanceof Error ? e.message : e)
    return { error: ERR.GENERIC }
  }
}

/**
 * Sets a new password for the currently authenticated user (after recovery token exchange).
 * The /auth/reset route handler exchanges the token for a session before this is called.
 */
export async function resetPassword(password: string, confirmPassword: string): Promise<{ error: string } | { success: true }> {
  try {
    if (password !== confirmPassword) return { error: ERR.PASSWORDS_MISMATCH }

    const cleanPassword = validatePassword(password)
    if (!cleanPassword) return { error: ERR.WEAK_PASSWORD }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: cleanPassword })
    if (error) return { error: ERR.RESET_FAILED }

    return { success: true }
  } catch (e) {
    return { error: toUserMessage(e, ERR.RESET_FAILED) }
  }
}
