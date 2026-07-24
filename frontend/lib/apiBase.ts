/**
 * lib/apiBase.ts — Canonical API base URL
 *
 * Importable from both client (React components, hooks) and server (sitemap,
 * route handlers) code. Keep this file free of any side-effects.
 *
 * API artık ayrı bir NestJS backend'inde değil, aynı Next.js uygulamasının
 * app/api/* route handler'larında yaşıyor. Tarayıcıda relative "/api" yeterli
 * (mevcut origin'e göre çözülür); sunucu tarafında (sitemap, route handler'dan
 * route handler'a çağrı vb.) fetch() mutlak URL istediği için origin'i
 * kendimiz kurmamız gerekiyor.
 */
function resolveApiBase(): string {
  const override = process.env.NEXT_PUBLIC_API_URL;
  // Eski/geçici mutlak URL override'ı (örn. ayrı barındırılan backend) hâlâ destekleniyor.
  if (override && /^https?:\/\//.test(override)) return override;

  if (typeof window !== 'undefined') return override ?? '/api';

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${override ?? '/api'}`;
  return `http://localhost:${process.env.PORT ?? 3000}${override ?? '/api'}`;
}

export const API_BASE = resolveApiBase();
