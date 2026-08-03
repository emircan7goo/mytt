/**
 * GET /api/admin/dealers/wallet-list — [Admin] Bayileri bakiye bilgisiyle listele.
 * (backend/src/admin/admin.service.ts → getDealersWithWallet'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const dealers = await prisma.user.findMany({
    where: { role: 'DEALER' },
    select: {
      id: true, name: true, email: true, companyName: true,
      isActive: true, walletBalance: true, commissionRate: true, createdAt: true,
      store: { select: { name: true, _count: { select: { dealerStock: true } } } },
      _count: { select: { ordersAsSeller: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = dealers.map((d) => ({
    ...d,
    companyName: d.companyName || d.store?.name || d.name || 'MYTT Yetkili Bayi',
  }));

  return NextResponse.json(mapped);
}
