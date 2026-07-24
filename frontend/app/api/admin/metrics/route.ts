/**
 * GET /api/admin/metrics — Platform geneli özet metrikler.
 * (backend/src/admin/admin.service.ts → getPlatformMetrics'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const [totalUsers, totalDealers, totalOrders, totalProducts, pendingKyc, openTickets] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'DEALER' } }),
    prisma.order.count(),
    prisma.dealerStock.count(),
    prisma.dealerApplication.count({ where: { status: 'PENDING' } }),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
  ]);

  const gmvResult = await prisma.order.aggregate({ _sum: { amount: true } });
  const avgResult = await prisma.order.aggregate({ _avg: { amount: true } });

  const gmv = Number(gmvResult._sum.amount ?? 0);
  const commission = gmv * 0.05;
  const avgOrderValue = Number(avgResult._avg.amount ?? 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = await prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

  return NextResponse.json({
    totalUsers, totalDealers, totalOrders, totalProducts, pendingKyc, openTickets,
    gmv, commission, avgOrderValue, recentOrders,
  });
}
