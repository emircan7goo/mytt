/**
 * POST /api/dealer-market — [Bayi] Cihaz ilan ver (admin onayı beklenir).
 * GET  /api/dealer-market — [Bayi] Aktif ilanları listele (kendi ilanları hariç).
 * (backend/src/dealer-market/dealer-market.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { expireStaleListings } from '@/lib/dealerMarket';

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const dto = await req.json().catch(() => null);
  if (typeof dto?.brand !== 'string' || typeof dto?.model !== 'string' || typeof dto?.grade !== 'string') {
    return NextResponse.json({ message: 'brand, model ve grade zorunludur.' }, { status: 400 });
  }
  if (dto.listingType !== 'AUCTION' && dto.listingType !== 'DIRECT') {
    return NextResponse.json({ message: 'listingType AUCTION veya DIRECT olmalıdır.' }, { status: 400 });
  }

  const seller = await prisma.user.findUnique({
    where: { id: gate.user.id },
    select: { walletBalance: true, isActive: true, role: true },
  });
  if (!seller?.isActive) return NextResponse.json({ message: 'Hesabınız aktif değil.' }, { status: 403 });

  const item = await prisma.dealerMarketItem.create({
    data: {
      sellerId: gate.user.id,
      brand: dto.brand,
      model: dto.model,
      storage: dto.storage,
      color: dto.color,
      grade: dto.grade,
      batteryHealth: dto.batteryHealth,
      hasBox: dto.hasBox ?? false,
      hasInvoice: dto.hasInvoice ?? false,
      hasAccessories: dto.hasAccessories ?? false,
      description: dto.description,
      images: dto.images ?? [],
      listingType: dto.listingType,
      floorPrice: dto.floorPrice,
      directPrice: dto.directPrice,
      durationHours: dto.durationHours ?? 1,
      status: 'PENDING_ADMIN',
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  await expireStaleListings();

  const items = await prisma.dealerMarketItem.findMany({
    where: { status: 'ACTIVE', adminApproved: true, sellerId: { not: gate.user.id } },
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { id: true, companyName: true, name: true } },
      bids: { where: { bidderId: gate.user.id }, select: { id: true, amount: true, note: true, createdAt: true } },
      _count: { select: { bids: true } },
    },
  });

  const result = items.map((item) => ({
    ...item,
    myBid: item.bids[0] ?? null,
    bids: undefined,
    bidCount: item._count.bids,
    _count: undefined,
  }));

  return NextResponse.json(result);
}
