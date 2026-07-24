/**
 * GET /api/dealer-market/my — [Bayi] Kendi ilanlarım (+ gelen teklifler).
 * (backend/src/dealer-market/dealer-market.service.ts → findMyListings'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const items = await prisma.dealerMarketItem.findMany({
    where: { sellerId: gate.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      bids: {
        where: { bidderId: { not: gate.user.id } },
        select: { id: true, amount: true, note: true, createdAt: true, bidder: { select: { id: true, name: true, companyName: true } } },
        orderBy: { amount: 'desc' },
      },
      _count: { select: { bids: true } },
    },
  });

  return NextResponse.json(items);
}
