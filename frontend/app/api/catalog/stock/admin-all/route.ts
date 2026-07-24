/**
 * GET /api/catalog/stock/admin-all — [Admin] Tüm bayi stokları (IMEI dahil).
 * (backend/src/catalog/catalog.service.ts → findAllStockAdmin'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const sp = req.nextUrl.searchParams;
  const brand = sp.get('brand') ?? undefined;
  const grade = sp.get('grade') ?? undefined;
  const search = sp.get('search') ?? undefined;
  const page = sp.get('page') ? parseInt(sp.get('page')!) : 1;
  const limit = sp.get('limit') ? parseInt(sp.get('limit')!) : 20;

  const where: Record<string, unknown> = {
    ...(grade && { grade }),
    ...((brand || search) && {
      globalProduct: {
        ...(brand && { brand: { equals: brand, mode: 'insensitive' } }),
        ...(search && {
          OR: [
            { brand: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.dealerStock.findMany({
      where,
      include: {
        globalProduct: { select: { id: true, brand: true, model: true, storage: true, color: true, masterImages: true } },
        store: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dealerStock.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
}
