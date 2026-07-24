/**
 * lib/commission.ts — Bayi net hakediş hesaplama
 * (backend/src/payout/payout.service.ts → private netOf'tan taşındı, paylaşılan hale getirildi)
 */
export function netOf(amount: unknown, commissionRate: unknown): number {
  return Number(amount) * (1 - Number(commissionRate));
}
