/**
 * PATCH /api/admin/orders/[id]/status — [Admin] Sipariş ödeme durumunu zorla güncelle.
 * (backend/src/admin/admin.service.ts → updateOrderStatus'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const paymentStatus = body?.paymentStatus;
  const valid = Object.values(PaymentStatus) as string[];
  if (typeof paymentStatus !== 'string' || !valid.includes(paymentStatus)) {
    return NextResponse.json({ message: `Geçersiz ödeme durumu: ${paymentStatus}` }, { status: 400 });
  }

  const order = await prisma.order.update({ where: { id }, data: { paymentStatus: paymentStatus as PaymentStatus } });
  await logActivity(gate.user.id, `ORDER_STATUS_CHANGE:${paymentStatus}`, 'Order', id, { paymentStatus });

  return NextResponse.json(order);
}
