/**
 * GET /api/cron/expire-sell-requests — Vercel Cron tarafından tetiklenir.
 * (backend/src/sell-requests/sell-requests.scheduler.ts + service.ts →
 *  runScheduledExpiry'den taşındı)
 *
 * NOT: Orijinal backend'de bu iş her dakika çalışıyordu (@Cron(EVERY_MINUTE)).
 * Vercel Hobby planında cron job'lar günde en fazla 1 kez tetiklenebiliyor —
 * bu platform kısıtı koddan aşılamaz. Talep durumunun EXPIRED'a geçmesi zaten
 * lib/dealerMarket.ts → expireStaleSellRequests() ile her okuma isteğinde
 * anlık gerçekleşiyor (email'siz); bu route sadece geciken "teklifleriniz
 * kapandı" bildirim emailini günde bir kez toplu gönderiyor.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAuctionExpired } from '@/lib/mail';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const candidates = await prisma.sellRequest.findMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
    include: {
      user: { select: { email: true, name: true } },
      bids: { orderBy: { amount: 'desc' }, take: 1 },
    },
  });

  if (candidates.length === 0) {
    return NextResponse.json({ expired: 0 });
  }

  await prisma.sellRequest.updateMany({
    where: { id: { in: candidates.map((r) => r.id) } },
    data: { status: 'EXPIRED' },
  });

  const results = await Promise.allSettled(
    candidates.map((request) => {
      const bestOffer = request.bids[0] ? Number(request.bids[0].amount) : null;
      return sendAuctionExpired({
        buyerEmail: request.user.email,
        buyerName: request.user.name ?? request.user.email,
        requestId: request.id,
        deviceName: `${request.brand} ${request.model}`,
        bestOffer,
        bidCount: request.bids.length,
      });
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ expired: candidates.length, emailsFailed: failed });
}
