/**
 * GET  /api/products — Public legacy ürün vitrini (filtreli/sıralı, bayi kimliği gizli).
 * POST /api/products — [Bayi] Kendi mağazasına yeni (legacy) ürün ekler.
 * (backend/src/product/product.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand = sp.get('brand') ?? undefined;
  const condition = sp.get('condition') ?? undefined;
  const minPrice = sp.get('minPrice') ? parseFloat(sp.get('minPrice')!) : undefined;
  const maxPrice = sp.get('maxPrice') ? parseFloat(sp.get('maxPrice')!) : undefined;
  const grade = sp.get('grade') ?? undefined;
  const batteryMin = sp.get('batteryMin') ? parseInt(sp.get('batteryMin')!) : undefined;
  const sort = sp.get('sort') ?? 'sponsored';
  const search = sp.get('search') ?? undefined;

  const where: Record<string, unknown> = {};
  if (brand) where.brand = { equals: brand, mode: 'insensitive' };
  if (condition) where.condition = condition;
  if (minPrice !== undefined) where.price = { ...(where.price as object ?? {}), gte: minPrice };
  if (maxPrice !== undefined) where.price = { ...(where.price as object ?? {}), lte: maxPrice };
  if (search) {
    where.OR = [
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (grade) where.specsJson = { path: ['cosmeticGrade'], equals: grade };

  const orderBy =
    sort === 'price_asc' ? [{ price: 'asc' as const }] :
    sort === 'price_desc' ? [{ price: 'desc' as const }] :
    sort === 'newest' ? [{ createdAt: 'desc' as const }] :
    [{ isSponsored: 'desc' as const }, { priority: 'desc' as const }, { createdAt: 'desc' as const }];

  let products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      store: { select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true } },
    },
  });

  if (batteryMin !== undefined) {
    products = products.filter((p) => {
      const specs = p.specsJson as Record<string, unknown> | null;
      const battery = specs?.batteryHealth as number | undefined;
      return battery === undefined || battery >= batteryMin;
    });
  }

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const dto = await req.json().catch(() => null);
  if (typeof dto?.brand !== 'string' || typeof dto?.model !== 'string' || typeof dto?.price !== 'number') {
    return NextResponse.json({ message: 'brand, model ve price zorunludur.' }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (!store) {
    return NextResponse.json({ message: 'Ürün ekleyebilmek için önce bir mağaza açmanız gerekiyor.' }, { status: 400 });
  }

  const product = await prisma.product.create({ data: { ...dto, storeId: store.id } });
  return NextResponse.json(product, { status: 201 });
}
