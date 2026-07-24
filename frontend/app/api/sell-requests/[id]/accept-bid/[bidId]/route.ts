/**
 * POST /api/sell-requests/[id]/accept-bid/[bidId] — [Müşteri] Teklifi kabul et.
 * (backend/src/sell-requests/sell-requests.service.ts → acceptBid'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { sendBidWon, sendSellRequestAccepted } from '@/lib/mail';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; bidId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { id: requestId, bidId } = await params;
  const request = await prisma.sellRequest.findFirst({
    where: { id: requestId, userId: user.id },
    include: { user: { select: { id: true, email: true, name: true } }, bids: { include: { dealer: true } } },
  });

  if (!request) return NextResponse.json({ message: 'Satış talebi bulunamadı.' }, { status: 404 });
  if (request.status !== 'EXPIRED' && request.status !== 'PENDING') {
    return NextResponse.json({ message: 'Bu talep artık teklif kabul etme aşamasında değil.' }, { status: 400 });
  }

  const bid = request.bids.find((b) => b.id === bidId);
  if (!bid) return NextResponse.json({ message: 'Teklif bulunamadı.' }, { status: 404 });

  const updated = await prisma.sellRequest.update({
    where: { id: requestId },
    data: { status: 'ACCEPTED', finalPrice: bid.amount, winningDealerId: bid.dealerId },
  });

  waitUntil(sendBidWon({
    dealerEmail: bid.dealer.email,
    dealerName: bid.dealer.name ?? bid.dealer.email,
    requestId,
    deviceName: `${request.brand} ${request.model}`,
    amount: Number(bid.amount),
  }));

  waitUntil(sendSellRequestAccepted({
    buyerEmail: request.user?.email ?? '',
    buyerName: request.user?.name ?? 'Müşteri',
    requestId,
    deviceName: `${request.brand} ${request.model}`,
    amount: Number(bid.amount),
  }));

  return NextResponse.json(updated);
}
