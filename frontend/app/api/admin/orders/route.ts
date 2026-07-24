/**
 * GET /api/admin/orders — [Admin] Tüm siparişler (alıcı/satıcı kişisel bilgisi gizli).
 * (backend/src/admin/admin.service.ts → getAllOrders'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: {
      product: { select: { brand: true, model: true, imagesUrl: true } },
      dealerStock: {
        select: { price: true, grade: true, globalProduct: { select: { brand: true, model: true, storage: true } } },
      },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true, companyName: true } },
    },
  });

  return NextResponse.json(orders);
}
