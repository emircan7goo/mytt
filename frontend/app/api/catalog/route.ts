/**
 * GET /api/catalog
 * Global ürün kataloğunu (opsiyonel filtrelerle) listeler.
 * (backend/src/catalog/catalog.service.ts → findAllGlobal'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand = sp.get('brand') ?? undefined;
  const search = sp.get('search') ?? undefined;
  const isActiveStr = sp.get('isActive') ?? undefined;
  const isActive = isActiveStr !== undefined ? isActiveStr !== 'false' : undefined;

  const items = await prisma.globalProduct.findMany({
    where: {
      ...(brand && { brand }),
      ...(search && {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      _count: { select: { dealerItems: true } },
    },
    orderBy: [{ brand: 'asc' }, { model: 'asc' }],
  });

  return NextResponse.json(items);
}
