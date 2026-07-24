/**
 * PATCH /api/orders/[id]/delivered — Müşteri teslim aldı + Escrow otomatik serbest.
 * (backend/src/order/order.service.ts → markDelivered'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new Error('NOT_FOUND');
      if (order.shippingStatus !== 'ADMIN_SHIPPED') throw new Error(`BAD_STATE:${order.shippingStatus}`);
      if (order.paymentStatus !== 'ESCROW') throw new Error('ALREADY_PROCESSED');

      return tx.order.update({
        where: { id },
        data: { shippingStatus: 'DELIVERED', deliveredAt: new Date(), paymentStatus: 'RELEASED' },
      });
    });

    await logActivity(user.id, 'RELEASE_ESCROW', 'Order', id, { trigger: 'DELIVERED', amount: updated.amount });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return NextResponse.json({ message: 'Sipariş bulunamadı.' }, { status: 404 });
    if (err.message === 'ALREADY_PROCESSED') return NextResponse.json({ message: 'Ödeme zaten işlenmiş.' }, { status: 400 });
    if (err.message?.startsWith('BAD_STATE')) {
      return NextResponse.json({ message: `Beklenen durum ADMIN_SHIPPED, mevcut: ${err.message.split(':')[1]}` }, { status: 400 });
    }
    throw err;
  }
}
