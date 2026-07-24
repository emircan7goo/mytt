/**
 * POST /api/dealer-market/[id]/buy — [Bayi] Sabit fiyatlı ilanı satın al.
 * (backend/src/dealer-market/dealer-market.service.ts → buyDirect'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id: itemId } = await params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.dealerMarketItem.findUnique({ where: { id: itemId } });
      if (!item) throw new Error('NOT_FOUND');
      if (item.sellerId === gate.user.id) throw new Error('SELF_PURCHASE');
      if (item.status !== 'ACTIVE') throw new Error('NOT_ACTIVE');
      if (item.listingType !== 'DIRECT') throw new Error('NOT_DIRECT');
      if (!item.directPrice) throw new Error('NO_PRICE');

      const dealer = await tx.user.findUnique({ where: { id: gate.user.id }, select: { walletBalance: true, isActive: true } });
      if (!dealer?.isActive) throw new Error('INACTIVE');
      if (Number(dealer.walletBalance ?? 0) <= 0) throw new Error('NO_BALANCE');

      return tx.dealerMarketItem.update({
        where: { id: itemId },
        data: { status: 'SOLD', winningBidderId: gate.user.id, finalPrice: item.directPrice },
      });
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const map: Record<string, [string, number]> = {
      NOT_FOUND: ['İlan bulunamadı.', 404],
      SELF_PURCHASE: ['Kendi ilanınızı satın alamazsınız.', 403],
      NOT_ACTIVE: ['Bu ilan aktif değil.', 400],
      NOT_DIRECT: ['Bu ilan sabit fiyatlı değil.', 400],
      NO_PRICE: ['Fiyat belirtilmemiş.', 400],
      INACTIVE: ['Hesabınız aktif değil.', 403],
      NO_BALANCE: ['Satın almak için bakiye yüklemeniz gerekiyor.', 403],
    };
    const [message, status] = map[err.message] ?? ['Bilinmeyen hata', 500];
    return NextResponse.json({ message }, { status });
  }
}
