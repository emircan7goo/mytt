/**
 * lib/dealerMarket.ts — paylaşılan yardımcı
 * (backend/src/dealer-market/dealer-market.service.ts → expireStaleListings'ten taşındı)
 *
 * NOT: Backend'de de gerçek bir cron değildi — findActiveListings/placeBid
 * her çağrıldığında lazy olarak çalıştırılıyordu. Aynı davranış korunuyor.
 */
import { prisma } from './prisma';

export async function expireStaleListings() {
  await prisma.dealerMarketItem.updateMany({
    where: { status: 'ACTIVE', listingType: 'AUCTION', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  });
}

/**
 * (backend/src/sell-requests/sell-requests.service.ts → expireStaleRequests'ten taşındı)
 * Lazy/inline versiyon — email göndermez (o iş normalde scheduler'ındı, henüz
 * taşınmadı). Her okuma endpoint'inin başında çağrılır.
 */
export async function expireStaleSellRequests() {
  await prisma.sellRequest.updateMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  });
}
