/**
 * GET /api/admin/pending-approvals — [Admin] Onay bekleyen her şeyi tek seferde döndürür
 * (satış talepleri + bayi stok girişleri + dealer-market ilanları + hakediş çekimleri).
 * (backend/src/admin/admin.service.ts → getPendingApprovals'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const [sellRequests, dealerStocks, dealerMarketItems, payoutRequests] = await Promise.all([
    prisma.sellRequest.findMany({
      where: { adminApproved: false, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.dealerStock.findMany({
      where: { adminApproved: false },
      orderBy: { createdAt: 'desc' },
      include: {
        globalProduct: true,
        store: { include: { owner: { select: { id: true, name: true, email: true, companyName: true } } } },
      },
    }),
    prisma.dealerMarketItem.findMany({
      where: { status: 'PENDING_ADMIN' },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: { id: true, name: true, email: true, companyName: true } } },
    }),
    prisma.payout.findMany({
      where: { status: 'PENDING' },
      orderBy: { requestedAt: 'desc' },
      include: { dealer: { select: { id: true, name: true, email: true, companyName: true } } },
    }),
  ]);

  return NextResponse.json({
    sellRequests,
    dealerStocks,
    dealerMarketItems,
    payoutRequests,
    totalCount: sellRequests.length + dealerStocks.length + dealerMarketItems.length + payoutRequests.length,
  });
}
