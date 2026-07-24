/**
 * GET /api/admin/dealers — Tüm bayilerin analitik listesi.
 * (backend/src/admin/admin.service.ts → getDealerAnalytics'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const [dealers, revenueGroups] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'DEALER' },
      select: {
        id: true, name: true, email: true, companyName: true,
        commissionRate: true, isActive: true, createdAt: true,
        store: {
          select: {
            name: true,
            _count: { select: { dealerStock: true } },
            dealerStock: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        _count: { select: { ordersAsSeller: true, tickets: { where: { status: 'OPEN' } } } },
        ordersAsSeller: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.groupBy({ by: ['sellerId'], _sum: { amount: true } }),
  ]);

  const revenueMap = new Map(revenueGroups.map((r) => [r.sellerId, Number(r._sum.amount ?? 0)]));
  const now = Date.now();

  const result = dealers.map((d) => {
    const lastStock = d.store?.dealerStock[0] ?? null;
    const lastOrder = d.ordersAsSeller[0] ?? null;
    const daysSinceLastStock = lastStock
      ? Math.floor((now - new Date(lastStock.createdAt).getTime()) / 86_400_000)
      : null;

    return {
      id: d.id, name: d.name, email: d.email, companyName: d.companyName,
      storeName: d.store?.name ?? '-',
      isActive: d.isActive, joinedAt: d.createdAt, commissionRate: d.commissionRate,
      totalStock: d.store?._count.dealerStock ?? 0,
      totalOrders: d._count.ordersAsSeller,
      totalRevenue: revenueMap.get(d.id) ?? 0,
      openTickets: d._count.tickets,
      lastStockDate: lastStock?.createdAt ?? null,
      lastOrderDate: lastOrder?.createdAt ?? null,
      daysSinceLastStock,
      isInactive: daysSinceLastStock !== null && daysSinceLastStock >= 10,
      hasNoStock: (d.store?._count.dealerStock ?? 0) === 0,
    };
  });

  return NextResponse.json(result);
}
