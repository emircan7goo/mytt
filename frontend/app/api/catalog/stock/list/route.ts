/**
 * GET /api/catalog/stock/list — Filtrelenmiş bayi stok listesi (public, IMEI gizli).
 * (backend/src/catalog/catalog.service.ts → findFilteredStock'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand = sp.get('brand') ?? undefined;
  const grade = sp.get('grade') ?? undefined;
  const batteryMin = sp.get('batteryMin') ? parseInt(sp.get('batteryMin')!) : undefined;
  const minPrice = sp.get('minPrice') ? parseFloat(sp.get('minPrice')!) : undefined;
  const maxPrice = sp.get('maxPrice') ? parseFloat(sp.get('maxPrice')!) : undefined;
  const hasBox = sp.get('hasBox') !== null ? sp.get('hasBox') !== 'false' : undefined;
  const hasInvoice = sp.get('hasInvoice') !== null ? sp.get('hasInvoice') !== 'false' : undefined;
  const sort = sp.get('sort') as 'price_asc' | 'price_desc' | 'grade_asc' | 'newest' | null;
  const page = sp.get('page') ? parseInt(sp.get('page')!) : 1;
  const limit = sp.get('limit') ? parseInt(sp.get('limit')!) : 20;

  const where: Prisma.DealerStockWhereInput = {
    stock: { gt: 0 },
    adminApproved: true,
    globalProduct: {
      isActive: true,
      ...(brand && { brand: { equals: brand, mode: 'insensitive' } }),
    },
    ...(grade && { grade }),
    ...(batteryMin && { batteryHealth: { gte: batteryMin } }),
    ...(minPrice !== undefined && { price: { gte: new Prisma.Decimal(minPrice) } }),
    ...(maxPrice !== undefined && { price: { lte: new Prisma.Decimal(maxPrice) } }),
    ...(hasBox !== undefined && { hasBox }),
    ...(hasInvoice !== undefined && { hasInvoice }),
  };

  const orderBy: Prisma.DealerStockOrderByWithRelationInput =
    sort === 'price_desc' ? { price: 'desc' } :
    sort === 'newest' ? { createdAt: 'desc' } :
    { price: 'asc' };

  const [items, total] = await prisma.$transaction([
    prisma.dealerStock.findMany({
      where, orderBy, skip: (page - 1) * limit, take: limit,
      include: {
        globalProduct: { select: { id: true, brand: true, model: true, storage: true, color: true, masterImages: true } },
        store: { select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true } },
      },
    }),
    prisma.dealerStock.count({ where }),
  ]);

  const offerCounts = await prisma.dealerStock.groupBy({
    by: ['globalProductId'],
    where: { adminApproved: true, stock: { gt: 0 } },
    _count: { _all: true },
  });
  const countMap = new Map(offerCounts.map((o) => [o.globalProductId, o._count._all]));
  const itemsWithOfferCount = items.map((i) => ({ ...i, offerCount: countMap.get(i.globalProductId) ?? 1 }));

  return NextResponse.json({ items: itemsWithOfferCount, total, page, limit, totalPages: Math.ceil(total / limit) });
}
