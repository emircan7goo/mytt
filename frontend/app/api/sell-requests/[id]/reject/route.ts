/**
 * POST /api/sell-requests/[id]/reject — [Müşteri] Tüm teklifleri reddet.
 * (backend/src/sell-requests/sell-requests.service.ts → rejectAllBids'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const request = await prisma.sellRequest.findFirst({ where: { id, userId: user.id } });
  if (!request) return NextResponse.json({ message: 'Satış talebi bulunamadı.' }, { status: 404 });
  if (request.status !== 'EXPIRED' && request.status !== 'PENDING') {
    return NextResponse.json({ message: 'Bu talep artık güncel değil.' }, { status: 400 });
  }

  const updated = await prisma.sellRequest.update({ where: { id }, data: { status: 'REJECTED' } });
  return NextResponse.json(updated);
}
