import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the user has an auth token
  const token = request.cookies.get('auth_token')?.value;

  // Define protected routes
  const protectedPaths = ['/dashboard', '/superadmin'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  const isCheckoutPath = request.nextUrl.pathname.startsWith('/events/') && request.nextUrl.pathname.endsWith('/checkout');

  // Redirect to login if accessing a protected route without a token
  if ((isProtectedPath || isCheckoutPath) && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged in and trying to access login or membership
  if (token && (request.nextUrl.pathname === '/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login',
    '/superadmin/:path*',
    '/events/:path*'
  ],
};
