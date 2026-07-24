/**
 * GET /api/sell-requests/dealer/[id] — [Bayi] Talep detayı.
 * (backend/src/sell-requests/sell-requests.service.ts → findRequestForDealer'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { expireStaleSellRequests } from '@/lib/dealerMarket';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  await expireStaleSellRequests();

  const { id } = await params;
  const request = await prisma.sellRequest.findUnique({
    where: { id },
    include: {
      bids: { where: { dealerId: gate.user.id }, select: { id: true, amount: true, note: true, createdAt: true } },
      _count: { select: { bids: true } },
    },
  });

  if (!request) return NextResponse.json({ message: 'Talep bulunamadı.' }, { status: 404 });

  return NextResponse.json({ ...request, myBid: request.bids[0] ?? null, bids: undefined, bidCount: request._count.bids, _count: undefined });
}
