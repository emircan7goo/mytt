/**
 * GET /api/payout/admin?status= — [Admin] Tüm çekim taleplerini listele.
 * (backend/src/payout/payout.service.ts → adminList'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const status = req.nextUrl.searchParams.get('status') ?? undefined;

  const payouts = await prisma.payout.findMany({
    where: status ? { status: status as any } : {},
    orderBy: { requestedAt: 'desc' },
    include: { dealer: { select: { id: true, name: true, email: true, companyName: true } } },
  });

  return NextResponse.json(payouts);
}
