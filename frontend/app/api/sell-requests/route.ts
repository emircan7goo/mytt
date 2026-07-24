/**
 * POST /api/sell-requests — [Müşteri] Yeni satış talebi oluştur.
 * (backend/src/sell-requests/sell-requests.service.ts → create'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';
import { sendSellRequestCreated, sendDealerNewSellRequest } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const dto = await req.json().catch(() => null);
  if (typeof dto?.brand !== 'string' || typeof dto?.model !== 'string' || typeof dto?.grade !== 'string') {
    return NextResponse.json({ message: 'brand, model ve grade zorunludur.' }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const request = await prisma.sellRequest.create({
    data: {
      userId: user.id,
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
      imagesUrl: dto.imagesUrl ?? [],
      requestType: dto.requestType ?? 'SELL',
      expiresAt,
      status: 'PENDING',
    },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  waitUntil(sendSellRequestCreated({
    buyerEmail: request.user.email,
    buyerName: request.user.name ?? request.user.email,
    requestId: request.id,
    deviceName: `${dto.brand} ${dto.model}`,
    expiresAt,
  }));

  // Tüm aktif bayilere bildirim (arka planda, hata olsa da isteği bloklamaz)
  waitUntil((async () => {
    const dealers = await prisma.user.findMany({
      where: { role: 'DEALER', isActive: true },
      select: { email: true, name: true },
      take: 500,
    });
    await Promise.all(dealers.map((dealer) => sendDealerNewSellRequest({
      dealerEmail: dealer.email,
      dealerName: dealer.name ?? dealer.email,
      requestId: request.id,
      deviceName: `${dto.brand} ${dto.model}`,
      grade: dto.grade,
    })));
  })());

  const { user: u, ...safeRequest } = request;
  return NextResponse.json({ ...safeRequest, user: { id: u.id, email: u.email, name: u.name } }, { status: 201 });
}
