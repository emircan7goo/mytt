/**
 * lib/apiBase.ts — Canonical API base URL
 *
 * Importable from both client (React components, hooks) and server (sitemap,
 * route handlers) code.  Keep this file free of any side-effects.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
