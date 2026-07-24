/**
 * GET /api/products/[id] — Tek (legacy) ürün detayı, bayi kimliği gizli.
 * (backend/src/product/product.service.ts → findById'den taşındı)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: { select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true } } },
  });

  if (!product) return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
  return NextResponse.json(product);
}
