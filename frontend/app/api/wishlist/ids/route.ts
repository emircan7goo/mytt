/**
 * GET /api/wishlist/ids — Favori ürün ID listesi (hızlı kalp kontrolü).
 * (backend/src/wishlist/wishlist.service.ts → getWishlistIds'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const items = await prisma.wishlist.findMany({ where: { userId: user.id }, select: { dealerStockId: true } });
  return NextResponse.json(items.map((i) => i.dealerStockId));
}
