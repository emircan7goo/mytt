/**
 * PATCH /api/dealer-market/admin/[id]/reject — [Admin] İlanı reddet.
 * (backend/src/dealer-market/dealer-market.service.ts → adminReject'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const adminNote: string | undefined = body?.adminNote;

  const item = await prisma.dealerMarketItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

  const updated = await prisma.dealerMarketItem.update({
    where: { id },
    data: { adminApproved: false, status: 'REJECTED', adminNote: adminNote ?? 'Reddedildi' },
  });

  return NextResponse.json(updated);
}
