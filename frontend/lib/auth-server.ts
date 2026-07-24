/**
 * lib/auth-server.ts — Sunucu tarafı JWT/cookie/oturum yardımcıları
 * (backend/src/auth/{auth.controller,auth.service,jwt.strategy}.ts'ten taşındı)
 *
 * NestJS'teki JwtAuthGuard/RolesGuard'ın karşılığı — Next.js'te route-level
 * decorator olmadığı için her route handler'ın başında `getAuthUser(req)` /
 * `requireAuth(req)` çağrılır.
 */
import jwt from 'jsonwebtoken';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import type { User, Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET tanımlı değil — .env dosyasını kontrol edin.');

export const ACCESS_COOKIE = 'jwt';
export const REFRESH_COOKIE = 'jwt_refresh';
const isProd = process.env.NODE_ENV === 'production';

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/',
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  // NestJS'te '/auth/refresh' idi — Next.js'te aynı route '/api/auth/refresh'.
  path: '/api/auth/refresh',
};

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
}

export function signAccessToken(payload: { email: string; sub: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(sub: string): string {
  return jwt.sign({ sub }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

/** Login/refresh sonrası her iki cookie'yi set eder (Route Handler içinden). */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, { ...ACCESS_COOKIE_OPTIONS, maxAge: 15 * 60 });
  store.set(REFRESH_COOKIE, refreshToken, { ...REFRESH_COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.set(ACCESS_COOKIE, '', { ...ACCESS_COOKIE_OPTIONS, maxAge: 0 });
  store.set(REFRESH_COOKIE, '', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * İstek üzerindeki `jwt` cookie'sini doğrular ve Prisma'dan güncel kullanıcıyı
 * döner. Cookie yok/geçersiz/kullanıcı pasifse null döner (hata fırlatmaz —
 * çağıran taraf 401'i kendi üretir).
 */
export async function getAuthUser(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = verifyJwt(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return null;
    if (user.isActive === false) return null;
    return user;
  } catch {
    return null;
  }
}

export function hasRole(user: User, roles: Role[]): boolean {
  return roles.includes(user.role);
}

/**
 * Route handler'ların başında kullanılır: `const gate = await requireRole(req, ['ADMIN']);
 * if (gate.error) return gate.error;` — kimlik doğrulanmamışsa 401, rol uymuyorsa 403 döner.
 */
export async function requireRole(
  req: NextRequest,
  roles: Role[],
): Promise<{ user: User; error: null } | { user: null; error: NextResponse }> {
  const user = await getAuthUser(req);
  if (!user) return { user: null, error: NextResponse.json({ message: 'Not authenticated' }, { status: 401 }) };
  if (!hasRole(user, roles)) return { user: null, error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  return { user, error: null };
}

/** `req.user.name` yoksa e-postanın @ öncesini kullanan görünen ad. */
export function displayName(user: Pick<User, 'name' | 'email'>): string {
  return user.name ?? user.email.split('@')[0];
}
