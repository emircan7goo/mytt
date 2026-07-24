/**
 * GET /api/payout/my-requests — [Bayi] Kendi çekim taleplerinin geçmişi.
 * (backend/src/payout/payout.service.ts → getMyPayouts'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const payouts = await prisma.payout.findMany({ where: { dealerId: gate.user.id }, orderBy: { requestedAt: 'desc' } });
  return NextResponse.json(payouts);
}
