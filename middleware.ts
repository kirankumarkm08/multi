import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Admin Authentication
  // Protects all routes starting with /admin
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('access_token')?.value;
    
    if (!adminToken) {
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // 2. Customer Authentication
  // Protects all routes starting with /customer
  if (pathname.startsWith('/customer')) {
    const customerToken = request.cookies.get('customer_token')?.value;
    
    if (!customerToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // 3. Redirect authenticated users away from auth pages
  
  // Admin Login
  if (pathname === '/admin-login') {
    const adminToken = request.cookies.get('access_token')?.value;
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }
  
  // Customer Login/Register
  if (pathname === '/login' || pathname === '/register') {
    const customerToken = request.cookies.get('customer_token')?.value;
    if (customerToken) {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/customer/:path*',
    '/admin-login',
    '/login',
    '/register',
  ],
};
