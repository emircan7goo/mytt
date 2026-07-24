/**
 * GET /api/sell-requests/dealer — [Bayi] Aktif satış taleplerini gör (müşteri kimliği gizli).
 * (backend/src/sell-requests/sell-requests.service.ts → findActiveForDealer'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { expireStaleSellRequests } from '@/lib/dealerMarket';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  await expireStaleSellRequests();

  const requests = await prisma.sellRequest.findMany({
    where: { status: { in: ['PENDING', 'EXPIRED'] }, adminApproved: true },
    orderBy: { createdAt: 'desc' },
    include: {
      bids: { where: { dealerId: gate.user.id }, select: { id: true, amount: true, note: true, createdAt: true } },
      _count: { select: { bids: true } },
    },
  });

  const result = requests.map((r) => ({
    ...r,
    myBid: r.bids[0] ?? null,
    bids: undefined,
    bidCount: r._count.bids,
    _count: undefined,
  }));

  return NextResponse.json(result);
}
