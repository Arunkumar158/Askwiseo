import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup') ||
                     request.nextUrl.pathname.startsWith('/forgot-password')

  // List of public routes that don't need authentication
  const publicRoutes = ['/', '/about', '/contact', '/pricing']

  // Check if it's a static file or api route
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // If the user is on an auth page and is authenticated, redirect to dashboard
  if (isAuthPage && authToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If the user is not authenticated and trying to access a protected route
  if (!authToken && !isAuthPage && !publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
