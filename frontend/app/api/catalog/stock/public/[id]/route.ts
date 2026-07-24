/**
 * GET /api/catalog/stock/public/[id] — Tekil stok detayı (public).
 * (backend/src/catalog/catalog.service.ts → findDealerStockById'dan taşındı)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stock = await prisma.dealerStock.findUnique({
    where: { id },
    include: {
      globalProduct: { select: { brand: true, model: true, storage: true, color: true, masterImages: true, specsJson: true } },
      store: { select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true } },
    },
  });
  if (!stock) return NextResponse.json({ message: 'Stok kaydı bulunamadı.' }, { status: 404 });
  return NextResponse.json(stock);
}
