/**
 * lib/payout.ts — Bayi hakediş özeti hesaplama (canlı, siparişler üzerinden)
 * (backend/src/payout/payout.service.ts → getEarnings'ten taşındı)
 * Hem GET /api/payout/my-earnings hem de POST /api/payout/request tarafından kullanılır.
 */
import { prisma } from './prisma';
import { netOf } from './commission';

export async function getEarnings(dealerId: string) {
  const orders = await prisma.order.findMany({
    where: { sellerId: dealerId, paymentStatus: { in: ['ESCROW', 'RELEASED'] } },
    select: { amount: true, commissionRate: true, paymentStatus: true },
  });

  const escrowPending = orders
    .filter((o) => o.paymentStatus === 'ESCROW')
    .reduce((sum, o) => sum + netOf(o.amount, o.commissionRate), 0);

  const releasedTotal = orders
    .filter((o) => o.paymentStatus === 'RELEASED')
    .reduce((sum, o) => sum + netOf(o.amount, o.commissionRate), 0);

  const payouts = await prisma.payout.findMany({ where: { dealerId } });

  const lockedByPayouts = payouts
    .filter((p) => p.status !== 'REJECTED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const withdrawable = Math.max(0, releasedTotal - lockedByPayouts);

  const inProcess = payouts
    .filter((p) => p.status === 'PENDING' || p.status === 'APPROVED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const paidPayouts = payouts
    .filter((p) => p.status === 'PAID')
    .sort((a, b) => +new Date(b.processedAt ?? 0) - +new Date(a.processedAt ?? 0));

  const dealer = await prisma.user.findUnique({ where: { id: dealerId }, select: { iban: true, ibanName: true } });

  return {
    escrowPending,
    withdrawable,
    inProcess,
    lastPayoutAmount: paidPayouts[0] ? Number(paidPayouts[0].amount) : 0,
    lastPayoutDate: paidPayouts[0]?.processedAt ?? null,
    iban: dealer?.iban ?? null,
    ibanName: dealer?.ibanName ?? null,
  };
}
