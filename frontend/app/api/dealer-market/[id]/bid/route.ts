/**
 * POST /api/dealer-market/[id]/bid — [Bayi] Teklif ver / güncelle.
 * (backend/src/dealer-market/dealer-market.service.ts → placeBid'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { expireStaleListings } from '@/lib/dealerMarket';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id: itemId } = await params;
  const dto = await req.json().catch(() => null);
  const amount = Number(dto?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ message: 'amount geçerli değil.' }, { status: 400 });
  }

  await expireStaleListings();

  const item = await prisma.dealerMarketItem.findUnique({ where: { id: itemId } });
  if (!item) return NextResponse.json({ message: 'İlan bulunamadı.' }, { status: 404 });
  if (item.sellerId === gate.user.id) return NextResponse.json({ message: 'Kendi ilanınıza teklif veremezsiniz.' }, { status: 403 });
  if (item.status !== 'ACTIVE') return NextResponse.json({ message: 'Bu ilan artık aktif değil.' }, { status: 400 });
  if (item.listingType === 'DIRECT') {
    return NextResponse.json({ message: 'Sabit fiyatlı ilana teklif verilemez. "Satın Al" kullanın.' }, { status: 400 });
  }
  if (item.expiresAt && new Date() > item.expiresAt) {
    return NextResponse.json({ message: 'Teklif süresi dolmuş.' }, { status: 400 });
  }
  if (amount < Number(item.floorPrice)) {
    return NextResponse.json({ message: `Teklif taban fiyatın altında olamaz. Min: ₺${item.floorPrice}` }, { status: 400 });
  }

  const dealer = await prisma.user.findUnique({ where: { id: gate.user.id }, select: { walletBalance: true, isActive: true } });
  if (!dealer?.isActive) return NextResponse.json({ message: 'Hesabınız aktif değil.' }, { status: 403 });
  if (Number(dealer.walletBalance ?? 0) <= 0) {
    return NextResponse.json({ message: 'Teklif vermek için bakiye yüklemeniz gerekiyor.' }, { status: 403 });
  }

  const bid = await prisma.dealerMarketBid.upsert({
    where: { itemId_bidderId: { itemId, bidderId: gate.user.id } },
    update: { amount, note: dto?.note, updatedAt: new Date() },
    create: { itemId, bidderId: gate.user.id, amount, note: dto?.note },
  });

  return NextResponse.json(bid);
}
