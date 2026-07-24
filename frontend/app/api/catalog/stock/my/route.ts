/**
 * GET /api/catalog/stock/my — Bayinin kendi stok kayıtları.
 * (backend/src/catalog/catalog.service.ts → findMyStock'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const store = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (!store) return NextResponse.json([]);

  const stock = await prisma.dealerStock.findMany({
    where: { storeId: store.id },
    include: { globalProduct: { select: { brand: true, model: true, storage: true, color: true, masterImages: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(stock);
}
