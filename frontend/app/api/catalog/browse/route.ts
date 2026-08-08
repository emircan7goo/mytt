/**
 * GET /api/catalog/browse
 * Public gruplu vitrin — her karttan bir marka+model ailesi, altında tüm
 * bayi tekliflerinin özeti. Bayi kimliği hiçbir alanda yer almaz.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { compareCondition, storageToGB, GRADE_RANK } from '@/lib/catalogUtils';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const brand      = sp.get('brand') ?? undefined;
  const search     = sp.get('search') ?? undefined;
  const grade      = sp.get('grade') ?? undefined;
  const batteryMin = sp.get('batteryMin') ? parseInt(sp.get('batteryMin')!) : undefined;
  const minPrice   = sp.get('minPrice') ? parseFloat(sp.get('minPrice')!) : undefined;
  const maxPrice   = sp.get('maxPrice') ? parseFloat(sp.get('maxPrice')!) : undefined;
  const hasBox     = sp.get('hasBox') !== null ? sp.get('hasBox') !== 'false' : undefined;
  const hasInvoice = sp.get('hasInvoice') !== null ? sp.get('hasInvoice') !== 'false' : undefined;
  const sort       = sp.get('sort') as 'price_asc' | 'price_desc' | 'best_condition' | 'newest' | 'popular' | null;
  const page       = sp.get('page') ? parseInt(sp.get('page')!) : 1;
  const limit      = sp.get('limit') ? parseInt(sp.get('limit')!) : 200;

  const stockWhere: Prisma.DealerStockWhereInput = {
    adminApproved: true,
    stock: { gt: 0 },
    ...(grade && { grade }),
    ...(batteryMin !== undefined && { batteryHealth: { gte: batteryMin } }),
    ...(hasBox     !== undefined && { hasBox }),
    ...(hasInvoice !== undefined && { hasInvoice }),
    ...(minPrice   !== undefined && { price: { gte: new Prisma.Decimal(minPrice) } }),
    ...(maxPrice   !== undefined && { price: { lte: new Prisma.Decimal(maxPrice) } }),
  };

  const variants = await prisma.globalProduct.findMany({
    where: {
      isActive: true,
      ...(brand  && { brand: { equals: brand, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }),
      dealerItems: { some: stockWhere },
    },
    include: {
      dealerItems: {
        where: stockWhere,
        select: { price: true, grade: true, batteryHealth: true, warrantyMonths: true, storeId: true, dealerImages: true },
      },
    },
  });

  interface FamilyAcc {
    brand: string;
    model: string;
    masterImages: string[];
    fallbackImages: string[];
    createdAt: Date;
    storageOptions: Set<string>;
    colorOptions: Set<string>;
    availableGrades: Set<string>;
    storeIds: Set<string>;
    offers: { price: number; grade: string; batteryHealth: number | null; hasWarranty: boolean }[];
  }
  const familyMap = new Map<string, FamilyAcc>();

  for (const v of variants) {
    const key = `${v.brand}|||${v.model}`;
    let fam = familyMap.get(key);
    if (!fam) {
      fam = {
        brand: v.brand, model: v.model,
        masterImages: [], fallbackImages: [], createdAt: v.createdAt,
        storageOptions: new Set(), colorOptions: new Set(),
        availableGrades: new Set(), storeIds: new Set(),
        offers: [],
      };
      familyMap.set(key, fam);
    }
    if (v.storage) fam.storageOptions.add(v.storage);
    if (v.color)   fam.colorOptions.add(v.color);
    if (fam.masterImages.length === 0 && v.masterImages.length > 0) fam.masterImages = v.masterImages;
    if (v.createdAt > fam.createdAt) fam.createdAt = v.createdAt;
    for (const o of v.dealerItems) {
      fam.availableGrades.add(o.grade);
      fam.storeIds.add(o.storeId);
      if (fam.fallbackImages.length === 0 && o.dealerImages?.length > 0) fam.fallbackImages = o.dealerImages;
      fam.offers.push({
        price: Number(o.price),
        grade: o.grade,
        batteryHealth: o.batteryHealth,
        hasWarranty: !!o.warrantyMonths && o.warrantyMonths > 0,
      });
    }
  }

  let families = Array.from(familyMap.values())
    .filter((f) => f.offers.length > 0)
    .map((f) => {
      const prices    = f.offers.map((o) => o.price);
      const batteries = f.offers.map((o) => o.batteryHealth).filter((b): b is number => b != null);
      const best      = f.offers.reduce((a, b) => (compareCondition(b, a) > 0 ? b : a));
      return {
        brand: f.brand,
        model: f.model,
        masterImages: f.masterImages.length > 0 ? f.masterImages : f.fallbackImages,
        createdAt: f.createdAt,
        storageOptions: Array.from(f.storageOptions).sort((a, b) => storageToGB(a) - storageToGB(b)),
        colorOptions: Array.from(f.colorOptions),
        availableGrades: Array.from(f.availableGrades).sort((a, b) => (GRADE_RANK[b] ?? 0) - (GRADE_RANK[a] ?? 0)),
        storeIds: Array.from(f.storeIds),
        offerCount: f.offers.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        batteryMin: batteries.length ? Math.min(...batteries) : null,
        batteryMax: batteries.length ? Math.max(...batteries) : null,
        bestGrade: best.grade,
        bestBatteryHealth: best.batteryHealth,
        hasWarrantyOffer: f.offers.some((o) => o.hasWarranty),
      };
    });

  switch (sort) {
    case 'price_desc':
      families.sort((a, b) => b.minPrice - a.minPrice);
      break;
    case 'best_condition':
      families.sort((a, b) =>
        compareCondition(
          { grade: b.bestGrade, batteryHealth: b.bestBatteryHealth },
          { grade: a.bestGrade, batteryHealth: a.bestBatteryHealth },
        ),
      );
      break;
    case 'newest':
      families.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      break;
    case 'popular':
      families.sort((a, b) => b.offerCount - a.offerCount);
      break;
    default:
      families.sort((a, b) => a.minPrice - b.minPrice);
  }

  const total = families.length;
  const items = families.slice((page - 1) * limit, (page - 1) * limit + limit);

  return NextResponse.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
}
