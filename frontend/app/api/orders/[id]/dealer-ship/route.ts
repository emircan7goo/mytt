/**
 * PATCH /api/orders/[id]/dealer-ship — Bayi merkeze kargo kodu girer (DEALER_SHIPPED).
 * (backend/src/order/order.service.ts → dealerUpdateTracking'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'DEALER') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const trackingCode = body?.trackingCode;
  if (typeof trackingCode !== 'string' || !trackingCode) {
    return NextResponse.json({ message: 'trackingCode zorunludur.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: 'Sipariş bulunamadı.' }, { status: 404 });
  if (order.sellerId !== user.id) return NextResponse.json({ message: 'Bu sipariş size ait değil.' }, { status: 403 });
  if (order.paymentStatus !== 'ESCROW') {
    return NextResponse.json({ message: 'Ödeme henüz onaylanmamış.' }, { status: 400 });
  }
  if (order.shippingStatus !== 'WAITING_DEALER_SHIPMENT') {
    return NextResponse.json({ message: `Sipariş zaten ${order.shippingStatus} durumunda.` }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { shippingStatus: 'DEALER_SHIPPED', dealerTrackingCode: trackingCode, dealerShippedAt: new Date() },
  });

  return NextResponse.json(updated);
}
