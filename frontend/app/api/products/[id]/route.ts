/**
 * app/api/products/[id]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js Route Handler — Single Product by ID
 * Falls back to mock data if the backend is unreachable.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/products/${id}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Backend responded ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    console.error(`[API /products/${id}] Backend unavailable.`);
    return NextResponse.json({ error: 'Ürün bulunamadı (Database bağlantısı yok)' }, { status: 404 });
  }
}
