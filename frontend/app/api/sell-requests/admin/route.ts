/**
 * GET /api/sell-requests/admin — [Admin] Tüm talepleri listele (filtreli).
 * (backend/src/sell-requests/sell-requests.service.ts → findAll'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { expireStaleSellRequests } from '@/lib/dealerMarket';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  await expireStaleSellRequests();

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') ?? undefined;
  const skip = sp.get('skip') ? Number(sp.get('skip')) : 0;
  const take = sp.get('take') ? Number(sp.get('take')) : 50;

  const where = status ? { status: status as any } : {};

  const [items, total] = await Promise.all([
    prisma.sellRequest.findMany({
      where, skip, take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        bids: { orderBy: { amount: 'desc' }, include: { dealer: { select: { id: true, email: true, name: true, companyName: true } } } },
        winningDealer: { select: { id: true, email: true, name: true, companyName: true } },
        _count: { select: { bids: true } },
      },
    }),
    prisma.sellRequest.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}
