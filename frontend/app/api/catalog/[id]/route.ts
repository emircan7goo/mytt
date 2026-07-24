/**
 * GET /api/catalog/[id]
 * Tek global ürün + tüm bayi teklifleri (anonim karşılaştırma sayfası için).
 * (backend/src/catalog/catalog.service.ts → findGlobalById'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compareCondition } from '@/lib/catalogUtils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sort = (req.nextUrl.searchParams.get('sort') as 'price_asc' | 'price_desc' | 'best_condition') ?? 'price_asc';

  const product = await prisma.globalProduct.findUnique({
    where: { id },
    include: {
      dealerItems: {
        where: { stock: { gt: 0 }, adminApproved: true },
        include: {
          store: {
            select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true },
          },
        },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ message: 'Ürün kataloğda bulunamadı.' }, { status: 404 });
  }

  const dealerItems = [...product.dealerItems].sort((a, b) => {
    if (sort === 'best_condition') return compareCondition(b, a);
    if (sort === 'price_desc') return Number(b.price) - Number(a.price);
    return Number(a.price) - Number(b.price);
  });

  return NextResponse.json({ ...product, dealerItems });
}
