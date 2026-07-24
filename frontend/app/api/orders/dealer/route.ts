/**
 * GET /api/orders/dealer — Bayi kendi aldığı siparişleri görür, buyerId gizli.
 * (backend/src/order/order.service.ts → getMyOrdersAsDealer'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'DEALER') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const orders = await prisma.order.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { id: true, brand: true, model: true, imagesUrl: true, stock: true } },
      dealerStock: {
        select: {
          id: true, price: true, grade: true, stock: true, dealerImages: true,
          globalProduct: { select: { brand: true, model: true, storage: true } },
        },
      },
    },
  });

  return NextResponse.json(orders);
}
