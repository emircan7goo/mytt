/**
 * GET /api/orders/my — Alıcı kendi siparişlerini görür. Satıcı kimliği gizli.
 * (backend/src/order/order.service.ts → getMyOrdersAsBuyer'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, brand: true, model: true, imagesUrl: true, condition: true } },
      dealerStock: {
        select: {
          id: true, price: true, grade: true, batteryHealth: true, dealerImages: true,
          globalProduct: { select: { brand: true, model: true, storage: true } },
        },
      },
    },
  });

  return NextResponse.json(orders);
}
