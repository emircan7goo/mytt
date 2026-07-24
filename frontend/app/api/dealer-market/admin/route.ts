/**
 * GET /api/dealer-market/admin?status= — [Admin] Tüm ilanlar.
 * (backend/src/dealer-market/dealer-market.service.ts → findAll'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const status = req.nextUrl.searchParams.get('status') ?? undefined;
  const where = status ? { status: status as any } : {};

  const [items, total] = await Promise.all([
    prisma.dealerMarketItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, email: true, name: true, companyName: true } },
        bids: { orderBy: { amount: 'desc' }, include: { bidder: { select: { id: true, email: true, name: true, companyName: true } } } },
        _count: { select: { bids: true } },
      },
    }),
    prisma.dealerMarketItem.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}
