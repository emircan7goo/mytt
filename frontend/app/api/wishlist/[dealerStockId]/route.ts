/**
 * POST   /api/wishlist/[dealerStockId] — Favorilere ekle.
 * DELETE /api/wishlist/[dealerStockId] — Favorilerden çıkar.
 * (backend/src/wishlist/wishlist.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ dealerStockId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { dealerStockId } = await params;
  const stock = await prisma.dealerStock.findUnique({ where: { id: dealerStockId } });
  if (!stock) return NextResponse.json({ message: 'Ürün bulunamadı' }, { status: 404 });

  await prisma.wishlist.upsert({
    where: { userId_dealerStockId: { userId: user.id, dealerStockId } },
    create: { userId: user.id, dealerStockId },
    update: {},
  });

  return NextResponse.json({ success: true, dealerStockId });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ dealerStockId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { dealerStockId } = await params;
  await prisma.wishlist.deleteMany({ where: { userId: user.id, dealerStockId } });

  return NextResponse.json({ success: true, dealerStockId });
}
