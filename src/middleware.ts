import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Define which routes require authentication and which roles are allowed
const protectedRoutes = {
  '/stock': ['STOCK_MANAGER', 'ADMIN'],
  '/product-code': ['PRODUCT_CODE_MANAGER', 'ADMIN'],
  '/production': ['STOCK_MANAGER', 'ADMIN'],
  '/admin': ['ADMIN']
}

// Define public routes that don't require authentication
const publicRoutes = ['/', '/login', '/api/auth/login', '/api/auth/logout']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if the route requires authentication
  const requiredRole = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1]

  if (!requiredRole) {
    // Route doesn't require specific role, allow access
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login for protected routes
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const decoded = verifyToken(token)
  if (!decoded) {
    // Token is invalid, redirect to login
    const loginUrl = new URL('/login', request.url)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('auth-token')
    return response
  }

  // Check role-based access
  const userRole = decoded.role
  const hasPermission = requiredRole.includes(userRole)

  if (!hasPermission) {
    // User doesn't have required role, redirect to unauthorized page
    const unauthorizedUrl = new URL('/unauthorized', request.url)
    return NextResponse.redirect(unauthorizedUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}