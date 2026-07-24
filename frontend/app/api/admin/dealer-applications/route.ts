/**
 * GET /api/admin/dealer-applications — Bekleyen bayi başvurularını listele.
 * (backend/src/admin/admin.service.ts → getPendingDealerApplications'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const applications = await prisma.dealerApplication.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(applications);
}
