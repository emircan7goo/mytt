/**
 * proxy.ts — Next.js Edge Proxy (RBAC Security Gate)
 *
 * Bu dosya her istekten ÖNCE çalışır (Edge Runtime).
 * Unauthenticated → /login?redirect=<path>
 * Wrong role      → /403
 *
 * NOT: Companion cookie (mytt_auth) UI routing için kullanılır.
 * Gerçek auth doğrulaması her zaman backend JWT ile yapılır.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, ROUTE_ROLE_MAP } from '@/lib/auth';
import type { AuthPayload } from '@/lib/auth';

const PROTECTED_PREFIXES = ['/admin', '/dealer', '/hesabim'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Tam prefix hit → ilgili dashboard'a yönlendir
  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  if (pathname === '/dealer') {
    return NextResponse.redirect(new URL('/dealer/dashboard', request.url));
  }

  // Korumalı prefix değilse geç
  const protectedPrefix = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p));
  if (!protectedPrefix) return NextResponse.next();

  // Auth cookie oku
  const rawCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Cookie yok → login
  if (!rawCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie'yi parse et
  let user: AuthPayload | null = null;
  try {
    user = JSON.parse(decodeURIComponent(rawCookie)) as AuthPayload;
  } catch {
    const loginUrl = new URL('/login', request.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }

  // Rol kontrolü
  const requiredRole = ROUTE_ROLE_MAP[protectedPrefix];
  const userRole = user?.role?.toLowerCase();
  const required = requiredRole?.toLowerCase();

  if (!user || userRole !== required) {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  // Geçerli — user bilgilerini header'a ekle (Server Component'larda kullanılabilir)
  const response = NextResponse.next();
  response.headers.set('x-user-role', user.role);
  response.headers.set('x-user-id', user.id);
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dealer/:path*',
    '/hesabim/:path*',
  ],
};
