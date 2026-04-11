import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res  = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname

  // Yeh pages bina login ke nahi dekh sakte
  const protectedRoutes = ['/profile', '/admin', '/watch']

  const isProtected = protectedRoutes.some(r => path.startsWith(r))

  // Login nahi hai aur protected route pe ja raha hai
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Login hai — ban check karo
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('banned, role')
      .eq('id', session.user.id)
      .single()

    // Admin route — sirf admin ja sakta hai
    if (path.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Banned user — logout karke login page par bhejo
    if (profile?.banned) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?banned=true', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/watch/:path*'],
}
