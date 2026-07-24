/**
 * PATCH /api/orders/[id]/release — Admin escrow'u manuel serbest bırakır.
 * Atomic guarded update — çifte çağrı yarışını engeller.
 * (backend/src/order/order.service.ts → releaseEscrow'dan taşındı)
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
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id } });
      if (!order) throw new Error('NOT_FOUND');
      if (order.paymentStatus !== 'ESCROW') throw new Error('ALREADY_PROCESSED');

      const updateResult = await tx.order.updateMany({
        where: { id, paymentStatus: 'ESCROW' },
        data: { paymentStatus: 'RELEASED', shippingStatus: 'DELIVERED', deliveredAt: new Date() },
      });
      if (updateResult.count === 0) throw new Error('STATE_CHANGED');

      return tx.order.findUnique({ where: { id } });
    });

    await logActivity(user.id, 'RELEASE_ESCROW', 'Order', id, { trigger: 'MANUAL', amount: result?.amount });

    return NextResponse.json(result);
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return NextResponse.json({ message: 'Sipariş bulunamadı.' }, { status: 404 });
    if (err.message === 'ALREADY_PROCESSED') return NextResponse.json({ message: 'Bu sipariş zaten işlenmiş.' }, { status: 400 });
    if (err.message === 'STATE_CHANGED') return NextResponse.json({ message: 'Sipariş durumu değişti, lütfen yenileyin.' }, { status: 400 });
    throw err;
  }
}
