"use server"

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

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
    const supabase = await createClient()
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name, phone: data.phone ?? null } },
    })
    if (error) throw new Error(friendlyAuthError(error))

    // Create the profile row immediately so FK constraints work
    if (result.user) {
      const admin = createAdminClient()
      await admin.from('profiles').upsert({
        id: result.user.id,
        email: data.email,
        full_name: data.full_name,
        phone: data.phone ?? null,
      }, { onConflict: 'id' })
    }

    return result
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
