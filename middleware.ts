import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to remote controller routes without authentication
  if (pathname.startsWith('/remote/')) {
    return NextResponse.next()
  }

  // Protect other routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) {
    const token = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token')
    
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/remote/:path*']
}