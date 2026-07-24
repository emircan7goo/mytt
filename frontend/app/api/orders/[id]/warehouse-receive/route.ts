/**
 * PATCH /api/orders/[id]/warehouse-receive — Admin merkeze teslim alır (WAREHOUSE_RECEIVED).
 * (backend/src/order/order.service.ts → warehouseReceive'dan taşındı)
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
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: 'Sipariş bulunamadı.' }, { status: 404 });
  if (order.shippingStatus !== 'DEALER_SHIPPED') {
    return NextResponse.json({ message: `Beklenen durum DEALER_SHIPPED, mevcut: ${order.shippingStatus}` }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { shippingStatus: 'WAREHOUSE_RECEIVED', warehouseReceivedAt: new Date() },
  });

  await logActivity(user.id, 'WAREHOUSE_RECEIVE', 'Order', id, { dealerTrackingCode: order.dealerTrackingCode });

  return NextResponse.json(updated);
}
