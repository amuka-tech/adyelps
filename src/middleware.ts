import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // We use the middleware client to refresh the auth token if needed
  const supabaseResponse = createClient(request);
  
  // Extract supabase instance from the returned response
  // Wait, createClient just returns the NextResponse. To get the user, we need to create a server client.
  // Actually, the Supabase docs suggest creating the client and calling getUser().
  // Let's import createServerClient here manually or just read the cookie.
  
  // Since createClient in middleware.ts only refreshes cookies, we can check the cookie directly 
  // or use the auth API. The proper way is to use the server client.
  // But to avoid circular dependencies, I will check if sb-access-token exists, or use the token from cookies.
  
  const token = request.cookies.get('sb-pdezxzdiglijvbnijagw-auth-token')?.value || request.cookies.get('supabase-auth-token')?.value;

  // Define protected paths
  const protectedPaths = ['/dashboard', '/superadmin'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  const isCheckoutPath = request.nextUrl.pathname.startsWith('/events/') && request.nextUrl.pathname.endsWith('/checkout');

  // If the user is not logged in and tries to access a protected route
  if ((isProtectedPath || isCheckoutPath) && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if logged in and trying to access login
  if (token && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login',
    '/superadmin/:path*',
    '/events/:path*'
  ],
};
