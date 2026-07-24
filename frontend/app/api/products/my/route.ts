/**
 * GET /api/products/my — [Bayi] Kendi mağazasının (legacy) ürünleri.
 * (backend/src/product/product.service.ts → findMyProducts'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const store = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (!store) return NextResponse.json([]);

  const products = await prisma.product.findMany({ where: { storeId: store.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}
