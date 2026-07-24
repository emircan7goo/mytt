/**
 * PATCH /api/sell-requests/[id]/shipping — [Müşteri] Kargo takip kodu gir.
 * (backend/src/sell-requests/sell-requests.service.ts → addShippingCode'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const shippingCode = body?.shippingCode?.trim();
  if (!shippingCode) return NextResponse.json({ message: 'Kargo kodu boş olamaz.' }, { status: 400 });

  const request = await prisma.sellRequest.findFirst({ where: { id, userId: user.id } });
  if (!request) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  if (request.status !== 'ACCEPTED') {
    return NextResponse.json({ message: 'Sadece kabul edilmiş taleplere kargo kodu girilebilir.' }, { status: 400 });
  }

  const updated = await prisma.sellRequest.update({ where: { id }, data: { status: 'SHIPPED', shippingCode } });
  return NextResponse.json(updated);
}
