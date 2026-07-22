/**
 * app/api/products/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Route Handler — Product List
 *
 * Tries to proxy the request to the NestJS backend (localhost:3000).
 * If the backend is down, falls back gracefully to MOCK_PRODUCTS so
 * the frontend never breaks in development.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/products`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`Backend responded ${res.status}`);

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // ── LIVE DATABASE ONLY ────────────────────────────────────────────────
    console.error('[API /products] Live Database/Backend unavailable.');
    return NextResponse.json([]); // STRICTLY return empty array, NO DEMO DATA
  }
}
