/**
 * POST /api/dealer-market/[id]/accept-bid/[bidId] — [Satıcı Bayi] Teklifi kabul et.
 * (backend/src/dealer-market/dealer-market.service.ts → acceptBid'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; bidId: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id: itemId, bidId } = await params;
  const item = await prisma.dealerMarketItem.findUnique({ where: { id: itemId }, include: { bids: true } });
  if (!item) return NextResponse.json({ message: 'İlan bulunamadı.' }, { status: 404 });
  if (item.sellerId !== gate.user.id) return NextResponse.json({ message: 'Bu ilan size ait değil.' }, { status: 403 });
  if (item.status !== 'ACTIVE' && item.status !== 'EXPIRED') {
    return NextResponse.json({ message: 'Bu işlem için ilan durumu uygun değil.' }, { status: 400 });
  }

  const bid = item.bids.find((b) => b.id === bidId);
  if (!bid) return NextResponse.json({ message: 'Teklif bulunamadı.' }, { status: 404 });

  const updated = await prisma.dealerMarketItem.update({
    where: { id: itemId },
    data: { status: 'SOLD', winningBidderId: bid.bidderId, finalPrice: bid.amount },
  });

  return NextResponse.json(updated);
}
