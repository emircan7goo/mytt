/**
 * PayoutService — Bayi Hakediş Çekim Sistemi
 *
 * Mantık:
 *  - Bir siparişin net hakedişi = amount * (1 - commissionRate)
 *  - ESCROW'daki siparişler   → "bekleyen" (henüz teslim onaylanmadı, dokunulmaz)
 *  - RELEASED siparişler      → "çekilebilir" bakiyeye eklenir
 *  - Payout talebi oluşunca o tutar "çekilebilir"den düşer, talep sonuçlanana kadar
 *    REJECTED olursa tekrar çekilebilir bakiyeye döner (otomatik — sorgu bazlı hesaplanıyor)
 *
 * Otomatik banka transferi YOK — admin talebi onaylar, elle EFT/havale yapar,
 * sonra "Ödendi" işaretler. Gerçek banka API entegrasyonu ayrı bir aşama.
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, PayoutStatus } from '@prisma/client';

interface RequestPayoutDto {
  amount?:   number;   // Belirtilmezse tüm çekilebilir bakiye talep edilir
  iban:      string;
  ibanName?: string;
}

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  private netOf(amount: unknown, commissionRate: unknown): number {
    return Number(amount) * (1 - Number(commissionRate));
  }

  /** Bir bayinin hakediş özetini hesaplar (siparişler + geçmiş talepler üzerinden, canlı). */
  async getEarnings(dealerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { sellerId: dealerId, paymentStatus: { in: [PaymentStatus.ESCROW, PaymentStatus.RELEASED] } },
      select: { amount: true, commissionRate: true, paymentStatus: true },
    });

    const escrowPending = orders
      .filter((o) => o.paymentStatus === PaymentStatus.ESCROW)
      .reduce((sum, o) => sum + this.netOf(o.amount, o.commissionRate), 0);

    const releasedTotal = orders
      .filter((o) => o.paymentStatus === PaymentStatus.RELEASED)
      .reduce((sum, o) => sum + this.netOf(o.amount, o.commissionRate), 0);

    const payouts = await this.prisma.payout.findMany({ where: { dealerId } });

    // REJECTED hariç her şey (PENDING/APPROVED/PAID) çekilebilir bakiyeden düşülmüş sayılır
    const lockedByPayouts = payouts
      .filter((p) => p.status !== PayoutStatus.REJECTED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const withdrawable = Math.max(0, releasedTotal - lockedByPayouts);

    const inProcess = payouts
      .filter((p) => p.status === PayoutStatus.PENDING || p.status === PayoutStatus.APPROVED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const paidPayouts = payouts
      .filter((p) => p.status === PayoutStatus.PAID)
      .sort((a, b) => +new Date(b.processedAt ?? 0) - +new Date(a.processedAt ?? 0));

    const dealer = await this.prisma.user.findUnique({
      where: { id: dealerId },
      select: { iban: true, ibanName: true },
    });

    return {
      escrowPending,
      withdrawable,
      inProcess,
      lastPayoutAmount: paidPayouts[0] ? Number(paidPayouts[0].amount) : 0,
      lastPayoutDate:   paidPayouts[0]?.processedAt ?? null,
      iban:     dealer?.iban ?? null,
      ibanName: dealer?.ibanName ?? null,
    };
  }

  /** Bayi çekim talebi oluşturur. */
  async requestPayout(dealerId: string, dto: RequestPayoutDto) {
    if (!dto.iban?.trim()) {
      throw new BadRequestException('IBAN girilmesi zorunludur.');
    }

    const { withdrawable } = await this.getEarnings(dealerId);
    if (withdrawable <= 0) {
      throw new BadRequestException('Çekilebilir bakiyeniz yok.');
    }

    const amount = dto.amount ?? withdrawable;
    if (amount <= 0 || amount > withdrawable + 0.01) {
      throw new BadRequestException(
        `Talep tutarı çekilebilir bakiyeyi (${withdrawable.toFixed(2)} ₺) aşamaz.`,
      );
    }

    // IBAN'ı hesaba kaydet — bir sonraki talepte tekrar girmesin
    await this.prisma.user.update({
      where: { id: dealerId },
      data: { iban: dto.iban.trim(), ibanName: dto.ibanName?.trim() || undefined },
    });

    return this.prisma.payout.create({
      data: {
        dealerId,
        amount,
        iban:     dto.iban.trim(),
        ibanName: dto.ibanName?.trim(),
        status:   PayoutStatus.PENDING,
      },
    });
  }

  /** Bayi kendi talep geçmişini görür. */
  async getMyPayouts(dealerId: string) {
    return this.prisma.payout.findMany({
      where: { dealerId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  async adminList(status?: PayoutStatus) {
    return this.prisma.payout.findMany({
      where: status ? { status } : {},
      orderBy: { requestedAt: 'desc' },
      include: {
        dealer: { select: { id: true, name: true, email: true, companyName: true } },
      },
    });
  }

  async adminApprove(id: string, adminId: string) {
    const payout = await this.findOrThrow(id);
    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Sadece bekleyen talepler onaylanabilir.');
    }
    return this.prisma.payout.update({
      where: { id },
      data: { status: PayoutStatus.APPROVED, processedBy: adminId },
    });
  }

  async adminMarkPaid(id: string, adminId: string, note?: string) {
    const payout = await this.findOrThrow(id);
    if (payout.status !== PayoutStatus.APPROVED && payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Bu talep zaten sonuçlanmış.');
    }
    return this.prisma.payout.update({
      where: { id },
      data: {
        status: PayoutStatus.PAID,
        processedAt: new Date(),
        processedBy: adminId,
        adminNote: note ?? payout.adminNote,
      },
    });
  }

  async adminReject(id: string, adminId: string, note?: string) {
    const payout = await this.findOrThrow(id);
    if (payout.status === PayoutStatus.PAID) {
      throw new BadRequestException('Ödenmiş bir talep reddedilemez.');
    }
    return this.prisma.payout.update({
      where: { id },
      data: {
        status: PayoutStatus.REJECTED,
        processedAt: new Date(),
        processedBy: adminId,
        adminNote: note ?? payout.adminNote,
      },
    });
  }

  private async findOrThrow(id: string) {
    const payout = await this.prisma.payout.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Hakediş talebi bulunamadı.');
    return payout;
  }
}
