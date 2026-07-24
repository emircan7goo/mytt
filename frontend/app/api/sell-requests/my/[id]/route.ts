/**
 * GET /api/sell-requests/my/[id] — [Müşteri] Kendi tekil talep detayı (bid'ler anonim).
 * (backend/src/sell-requests/sell-requests.service.ts → findMyRequest'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { expireStaleSellRequests } from '@/lib/dealerMarket';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  await expireStaleSellRequests();

  const { id } = await params;
  const request = await prisma.sellRequest.findFirst({
    where: { id, userId: user.id },
    include: {
      bids: { select: { id: true, amount: true, note: true, createdAt: true }, orderBy: { amount: 'desc' } },
      winningDealer: { select: { id: true, name: true, companyName: true } },
    },
  });

  if (!request) return NextResponse.json({ message: 'Satış talebi bulunamadı.' }, { status: 404 });

  return NextResponse.json({
    ...request,
    bids: request.bids.map((bid, i) => ({ id: bid.id, amount: bid.amount, note: bid.note, createdAt: bid.createdAt, dealerTag: `Bayi #${i + 1}` })),
  });
}
