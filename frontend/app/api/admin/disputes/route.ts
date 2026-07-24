/**
 * GET /api/admin/disputes — Tüm anlaşmazlıkları listele.
 * (backend/src/admin/admin.service.ts → getDisputes'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const disputes = await prisma.order.findMany({
    where: { OR: [{ paymentStatus: 'REFUNDED' }, { disputeStatus: { not: null } }] },
    select: {
      id: true, amount: true, paymentStatus: true,
      disputeStatus: true, disputeType: true, disputeNote: true,
      createdAt: true, updatedAt: true,
      buyer: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true, companyName: true } },
      product: { select: { brand: true, model: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(disputes);
}
