/**
 * lib/auth.ts — RBAC Auth Helpers
 * Cookie-based mock auth for development.
 * Production: replace with NextAuth / JWT HttpOnly cookies.
 */
import type { UserRole } from './mock-data';

export const AUTH_COOKIE_NAME = 'mytt_auth';

// ─────────────────────────────────────────────────────────────────────────────
// Companion Session Cookie (NON-HttpOnly)
//
// HttpOnly `jwt` cookie'sini backend (port 3001) set ediyor — XSS güvenliği için.
// Ancak frontend `proxy.ts` middleware'i edge'de çalıştığı için cross-origin
// HttpOnly cookie'yi okuyamaz. Çözüm: login response'undan sonra frontend kendi
// origin'inde (port 3000) küçük bir non-HttpOnly companion cookie set eder.
// Bu cookie sadece **UI routing** için kullanılır — gerçek auth doğrulaması
// her zaman backend'de JWT ile yapılır. Dolayısıyla bu cookie tampering'e karşı
// güvenlik sınıfı düşüktür ama bu kabul edilebilir.
// ─────────────────────────────────────────────────────────────────────────────
export function setSessionCookie(user: AuthPayload) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    commissionRate: user.commissionRate,
    b2bStatus: user.b2bStatus,
  }));
  // 7 gün (saniye) — backend HttpOnly cookie ile aynı süre
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0`;
}

export interface AuthPayload {
  id:             string;
  name:           string;
  email:          string;
  avatar?:        string;
  role:           UserRole;
  commissionRate?: number;
  walletBalance?:  number;
  b2bStatus?:     string;
  emailVerified?: boolean;
}

// Route → Required Role mapping
export const ROUTE_ROLE_MAP: Record<string, UserRole> = {
  '/admin':   'admin',
  '/dealer':  'dealer',
  '/hesabim': 'customer',
};

// Dashboard redirect after login
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  admin:    '/admin/dashboard',
  dealer:   '/dealer/dashboard',
  customer: '/hesabim',
};

// Demo credentials kaldırıldı — tüm girişler gerçek backend üzerinden yapılır.
