/**
 * GET /api/dealer-market/admin/[id] — [Admin] Tekil ilan tam detay.
 * (backend/src/dealer-market/dealer-market.service.ts → findOneAdmin'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const item = await prisma.dealerMarketItem.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, email: true, name: true, companyName: true } },
      bids: { orderBy: { amount: 'desc' }, include: { bidder: { select: { id: true, email: true, name: true, companyName: true } } } },
      winningBidder: { select: { id: true, email: true, name: true, companyName: true } },
    },
  });
  if (!item) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

  return NextResponse.json(item);
}
