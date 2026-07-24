/**
 * POST /api/sell-requests/dealer/[id]/bid — [Bayi] Teklif ver / güncelle.
 * (backend/src/sell-requests/sell-requests.service.ts → placeBid'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { expireStaleSellRequests } from '@/lib/dealerMarket';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id: requestId } = await params;
  const dto = await req.json().catch(() => null);
  const amount = Number(dto?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: 'amount geçerli değil.' }, { status: 400 });
  }

  await expireStaleSellRequests();

  const request = await prisma.sellRequest.findUnique({ where: { id: requestId } });
  if (!request) return NextResponse.json({ message: 'Talep bulunamadı.' }, { status: 404 });
  if (request.status !== 'PENDING') {
    return NextResponse.json({ message: 'Bu talep için teklif süresi dolmuş veya talep aktif değil.' }, { status: 400 });
  }
  if (new Date() > request.expiresAt) {
    return NextResponse.json({ message: 'Teklif süresi dolmuş.' }, { status: 400 });
  }

  const dealer = await prisma.user.findUnique({ where: { id: gate.user.id }, select: { walletBalance: true, isActive: true } });
  if (!dealer?.isActive) return NextResponse.json({ message: 'Hesabınız aktif değil.' }, { status: 403 });
  if (!dealer.walletBalance || Number(dealer.walletBalance) <= 0) {
    return NextResponse.json({ message: 'Teklif vermek için bakiye yüklemeniz gerekiyor. Lütfen admin ile iletişime geçin.' }, { status: 403 });
  }

  const bid = await prisma.sellRequestBid.upsert({
    where: { sellRequestId_dealerId: { sellRequestId: requestId, dealerId: gate.user.id } },
    update: { amount, note: dto?.note, updatedAt: new Date() },
    create: { sellRequestId: requestId, dealerId: gate.user.id, amount, note: dto?.note },
  });

  return NextResponse.json(bid);
}
