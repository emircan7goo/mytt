/**
 * PATCH /api/orders/[id]/admin-ship — Admin müşteriye kargolar (ADMIN_SHIPPED).
 * (backend/src/order/order.service.ts → adminShipToCustomer'dan taşındı)
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
  const trackingCode = body?.trackingCode;
  if (typeof trackingCode !== 'string' || !trackingCode) {
    return NextResponse.json({ message: 'trackingCode zorunludur.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: 'Sipariş bulunamadı.' }, { status: 404 });
  if (order.shippingStatus !== 'INSPECTION_PASSED') {
    return NextResponse.json({ message: `Beklenen durum INSPECTION_PASSED, mevcut: ${order.shippingStatus}` }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { shippingStatus: 'ADMIN_SHIPPED', adminTrackingCode: trackingCode, adminShippedAt: new Date() },
  });

  await logActivity(user.id, 'ADMIN_SHIP_TO_CUSTOMER', 'Order', id, { trackingCode });

  return NextResponse.json(updated);
}
