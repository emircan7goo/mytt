/**
 * GET /api/stores/premium
 * (backend/src/store/store.service.ts → findPremium'dan taşındı)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const stores = await prisma.store.findMany({
    where: { isPremium: true },
    take: 10,
    orderBy: { rating: 'desc' },
    include: {
      products: {
        take: 3,
        orderBy: { priority: 'desc' },
      },
    },
  });
  return NextResponse.json(stores);
}
