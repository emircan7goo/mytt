/**
 * GET /api/catalog/family?brand=&model=
 * Bir marka+model ailesinin TÜM varyant (depolama/renk) ve TÜM bayi
 * tekliflerini birlikte döndürür — "tüm iPhone 12'ler" karşılaştırma sayfası.
 * (backend/src/catalog/catalog.service.ts → findFamilyDetail'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { compareCondition, storageToGB } from '@/lib/catalogUtils';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand = sp.get('brand');
  const model = sp.get('model');
  if (!brand || !model) {
    return NextResponse.json({ message: 'brand ve model parametreleri zorunlu.' }, { status: 400 });
  }

  const sort       = sp.get('sort') as 'price_asc' | 'price_desc' | 'best_condition' | null;
  const storage    = sp.get('storage') ?? undefined;
  const grade      = sp.get('grade') ?? undefined;
  const batteryMin = sp.get('batteryMin') ? parseInt(sp.get('batteryMin')!) : undefined;
  const minPrice   = sp.get('minPrice') ? parseFloat(sp.get('minPrice')!) : undefined;
  const maxPrice   = sp.get('maxPrice') ? parseFloat(sp.get('maxPrice')!) : undefined;

  const variants = await prisma.globalProduct.findMany({
    where: { brand: { equals: brand, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' }, isActive: true },
  });
  if (!variants.length) {
    return NextResponse.json({ message: 'Bu model kataloğda bulunamadı.' }, { status: 404 });
  }

  const variantIds = variants.map((v) => v.id);

  const allOffers = await prisma.dealerStock.findMany({
    where: { adminApproved: true, stock: { gt: 0 }, globalProductId: { in: variantIds } },
    select: { price: true, batteryHealth: true, grade: true, globalProductId: true },
  });
  if (!allOffers.length) {
    return NextResponse.json({ message: 'Bu model için şu anda aktif teklif yok.' }, { status: 404 });
  }

  const allPrices    = allOffers.map((o) => Number(o.price));
  const allBatteries = allOffers.map((o) => o.batteryHealth).filter((b): b is number => b != null);
  const offeredVariantIds = new Set(allOffers.map((o) => o.globalProductId));

  const matchingVariantIds = storage
    ? variants.filter((v) => v.storage === storage).map((v) => v.id)
    : variantIds;

  const items = await prisma.dealerStock.findMany({
    where: {
      adminApproved: true,
      stock: { gt: 0 },
      globalProductId: { in: matchingVariantIds },
      ...(grade && { grade }),
      ...(batteryMin !== undefined && { batteryHealth: { gte: batteryMin } }),
      ...(minPrice   !== undefined && { price: { gte: new Prisma.Decimal(minPrice) } }),
      ...(maxPrice   !== undefined && { price: { lte: new Prisma.Decimal(maxPrice) } }),
    },
    include: {
      globalProduct: { select: { id: true, storage: true, color: true } },
      store: {
        select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true },
      },
    },
  });

  const sorted = [...items].sort((a, b) => {
    if (sort === 'best_condition') return compareCondition(b, a);
    if (sort === 'price_desc') return Number(b.price) - Number(a.price);
    return Number(a.price) - Number(b.price);
  });

  const masterImages =
    variants.find((v) => v.masterImages.length > 0)?.masterImages
    ?? sorted.find((o) => o.dealerImages?.length > 0)?.dealerImages
    ?? [];

  return NextResponse.json({
    brand: variants[0].brand,
    model: variants[0].model,
    masterImages,
    specsJson: variants.find((v) => v.specsJson)?.specsJson ?? null,
    storageOptions: Array.from(new Set(
      variants.filter((v) => offeredVariantIds.has(v.id)).map((v) => v.storage).filter(Boolean) as string[],
    )).sort((a, b) => storageToGB(a) - storageToGB(b)),
    priceRange:   { min: Math.min(...allPrices), max: Math.max(...allPrices) },
    batteryRange: allBatteries.length ? { min: Math.min(...allBatteries), max: Math.max(...allBatteries) } : null,
    offerCount: allOffers.length,
    items: sorted,
  });
}
