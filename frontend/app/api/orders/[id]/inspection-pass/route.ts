/**
 * PATCH /api/orders/[id]/inspection-pass — Admin denetimi geçirir (INSPECTION_PASSED).
 * (backend/src/order/order.service.ts → adminPassInspection'dan taşındı)
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
  const body = await req.json().catch(() => null);
  const notes: string | undefined = body?.notes;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: 'Sipariş bulunamadı.' }, { status: 404 });
  if (order.shippingStatus !== 'WAREHOUSE_RECEIVED') {
    return NextResponse.json({ message: `Beklenen durum WAREHOUSE_RECEIVED, mevcut: ${order.shippingStatus}` }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { shippingStatus: 'INSPECTION_PASSED', inspectionNotes: notes ?? null, inspectionPassedAt: new Date() },
  });

  await logActivity(user.id, 'INSPECTION_PASSED', 'Order', id, { notes });

  return NextResponse.json(updated);
}
