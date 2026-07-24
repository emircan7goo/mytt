/**
 * GET /api/catalog/requests/all — [Admin] Tüm bayi stok taleplerini listele.
 * (backend/src/catalog/catalog.service.ts → getAllStockRequests'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const requests = await prisma.stockRequest.findMany({
    include: { user: { select: { id: true, name: true, email: true, companyName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(requests);
}
