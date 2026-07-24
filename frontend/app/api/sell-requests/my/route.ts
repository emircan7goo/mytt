/**
 * GET /api/sell-requests/my — [Müşteri] Kendi satış taleplerini listele (bid'ler anonim).
 * (backend/src/sell-requests/sell-requests.service.ts → findMyRequests'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { expireStaleSellRequests } from '@/lib/dealerMarket';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  await expireStaleSellRequests();

  const requests = await prisma.sellRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      bids: { select: { id: true, amount: true, note: true, createdAt: true }, orderBy: { amount: 'desc' } },
      winningDealer: { select: { id: true, name: true, companyName: true } },
    },
  });

  const result = requests.map((r) => ({
    ...r,
    bids: r.bids.map((bid, i) => ({ id: bid.id, amount: bid.amount, note: bid.note, createdAt: bid.createdAt, dealerTag: `Bayi #${i + 1}` })),
  }));

  return NextResponse.json(result);
}
