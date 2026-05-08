import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // If env vars are missing, skip auth checks rather than crashing
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() to validate the session against the Supabase server.
  // getSession() only reads the local cookie and will trust a stale token
  // for a deleted user, causing an infinite redirect loop.
  const { data: { user } } = await supabase.auth.getUser()
  const session = user ? true : null
  const { pathname } = request.nextUrl

  // Redirect unauthenticated users away from protected routes
  // /admin is the login page — always accessible
  if (!session && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect custom artwork and photo enlargement — must be logged in
  if (!session && (pathname.startsWith('/custom-artwork') || pathname.startsWith('/photo-enlarge') || pathname.startsWith('/checkout'))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect /admin/* sub-routes (not /admin itself which is the login page)
  if (!session && pathname.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Redirect authenticated users away from public auth pages
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect /admin/* — must be admin role
  if (session && pathname.startsWith('/admin/')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
