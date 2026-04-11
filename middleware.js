import { NextResponse } from 'next/server'

export async function middleware(req) {
  const path = req.nextUrl.pathname

  // Sabhi cookies check karo
  const cookies = req.cookies.getAll()
  const hasSession = cookies.some(c => 
    c.name.includes('auth-token') || 
    c.name.includes('access-token') ||
    c.name.startsWith('sb-')
  )

  const needsLogin = ['/profile', '/admin', '/watch'].some(r => path.startsWith(r))

  if (needsLogin && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*', '/watch/:path*'],
}
