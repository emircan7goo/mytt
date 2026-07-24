/**
 * GET /api/catalog/requests/my — Bayinin kendi stok talepleri.
 * (backend/src/catalog/catalog.service.ts → getMyStockRequests'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const requests = await prisma.stockRequest.findMany({
    where: { userId: gate.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(requests);
}
