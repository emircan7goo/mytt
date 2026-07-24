/**
 * GET /api/admin/users — Tüm müşteri ve bayileri listele.
 * (backend/src/admin/admin.service.ts → getAllUsers'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const users = await prisma.user.findMany({
    where: { role: { in: ['CUSTOMER', 'DEALER'] } },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, b2bStatus: true,
      commissionRate: true, companyName: true, createdAt: true,
      _count: { select: { ordersAsBuyer: true } },
      ordersAsSeller: { select: { amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = users.map((u) => ({
    id: u.id,
    name: u.name ?? u.email.split('@')[0],
    email: u.email,
    role: u.role.toLowerCase() as 'customer' | 'dealer',
    isActive: u.isActive,
    b2bStatus: u.b2bStatus,
    commissionRate: u.commissionRate,
    companyName: u.companyName,
    joinedAt: u.createdAt,
    totalOrders: u._count.ordersAsBuyer,
    totalRevenue: u.ordersAsSeller.reduce((sum, o) => sum + Number(o.amount), 0),
    status: !u.isActive ? 'banned' : u.b2bStatus === 'PENDING' ? 'pending_kyc' : 'active',
  }));

  return NextResponse.json(result);
}
