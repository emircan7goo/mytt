/**
 * GET /api/sell-requests/admin/stats — [Admin] İstatistikler.
 * (backend/src/sell-requests/sell-requests.service.ts → getStats'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const [total, pending, expired, accepted, completed, rejected, totalBids] = await Promise.all([
    prisma.sellRequest.count(),
    prisma.sellRequest.count({ where: { status: 'PENDING' } }),
    prisma.sellRequest.count({ where: { status: 'EXPIRED' } }),
    prisma.sellRequest.count({ where: { status: { in: ['ACCEPTED', 'SHIPPED', 'RECEIVED'] } } }),
    prisma.sellRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.sellRequest.count({ where: { status: 'REJECTED' } }),
    prisma.sellRequestBid.count(),
  ]);

  const avgBids = total > 0 ? (totalBids / total).toFixed(1) : '0';

  return NextResponse.json({ total, pending, expired, accepted, completed, rejected, totalBids, avgBids });
}
