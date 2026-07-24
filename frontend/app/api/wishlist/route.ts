/**
 * GET /api/wishlist — Favori listesini getir.
 * (backend/src/wishlist/wishlist.service.ts → getWishlist'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const items = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      dealerStock: {
        include: {
          globalProduct: { select: { id: true, brand: true, model: true, storage: true, color: true, masterImages: true } },
          store: { select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true } },
        },
      },
    },
  });

  const result = items.map((item) => ({
    id: item.id,
    dealerStockId: item.dealerStockId,
    addedAt: item.createdAt,
    product: {
      id: item.dealerStock.id,
      brand: item.dealerStock.globalProduct.brand,
      model: item.dealerStock.globalProduct.model,
      storage: item.dealerStock.globalProduct.storage,
      color: item.dealerStock.globalProduct.color,
      masterImage: item.dealerStock.globalProduct.masterImages?.[0] ?? null,
      grade: item.dealerStock.grade,
      batteryHealth: item.dealerStock.batteryHealth,
      price: Number(item.dealerStock.price),
      stock: item.dealerStock.stock,
      store: item.dealerStock.store,
    },
  }));

  return NextResponse.json(result);
}
