/**
 * GET /api/products/store/[storeId] — Belirli bir mağazanın (legacy) ürünleri.
 * (backend/src/product/product.service.ts → findByStore'dan taşındı)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ storeId: string }> }) {
  const { storeId } = await params;
  const products = await prisma.product.findMany({ where: { storeId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}
