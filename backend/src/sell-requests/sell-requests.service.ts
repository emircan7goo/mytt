/**
 * SellRequestsService
 *
 * İş Akışı:
 *  1. Müşteri form gönderir → SellRequest oluşur (expiresAt = now + 30dk)
 *  2. Tüm onaylı bayilere email gönderilir
 *  3. Müşteriye onay emaili gönderilir
 *  4. Bayiler 30 dakika içinde kapalı teklif gönderir (bakiyesi olanlar)
 *  5. 30 dk dolunca SellRequest otomatik EXPIRED’a geçer
 *  6. Müşteri en iyi teklifi anonim olarak görür → ACCEPTED veya REJECTED yapabilir
 *  7. ACCEPTED → kargo aşaması → RECEIVED → COMPLETED
 */
import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { UpdateSellRequestDto } from './dto/update-sell-request.dto';
import { SellRequestStatus, Role, RequestType } from '@prisma/client';

@Injectable()
export class SellRequestsService {
  private readonly logger = new Logger(SellRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private mail:   MailService,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  // Müşteri: Yeni Satış Talebi Oluştur
  // ──────────────────────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateSellRequestDto) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // +30 dakika

    const request = await this.prisma.sellRequest.create({
      data: {
        userId,
        brand:          dto.brand,
        model:          dto.model,
        storage:        dto.storage,
        color:          dto.color,
        grade:          dto.grade,
        batteryHealth:  dto.batteryHealth,
        hasBox:         dto.hasBox         ?? false,
        hasInvoice:     dto.hasInvoice     ?? false,
        hasAccessories: dto.hasAccessories ?? false,
        description:    dto.description,
        imagesUrl:      dto.imagesUrl ?? [],
        requestType:    (dto.requestType as RequestType) ?? RequestType.SELL,
        expiresAt,
        status:         SellRequestStatus.PENDING,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    // ── Müşteriye onay emaili ───────────────────────────────────────────────
    this.mail.sendSellRequestCreated({
      buyerEmail:  request.user.email,
      buyerName:   request.user.name ?? request.user.email,
      requestId:   request.id,
      deviceName:  `${dto.brand} ${dto.model}`,
      expiresAt,
    }).catch(() => {}); // email hatası akışı durdurmasın

    // ── Tüm aktif bayilere bildirim ────────────────────────────────────────
    this.notifyAllDealers(request.id, `${dto.brand} ${dto.model}`, dto.grade).catch(() => {});

    // Güvenlik: user alanını yanıttan çıkar (id/email/name yeterli, hash'ler kesinlikle dışarı çıkmamalı)
    const { user: _u, ...safeRequest } = request;
    return { ...safeRequest, user: { id: _u.id, email: _u.email, name: _u.name } };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Müşteri: Kendi Satış Taleplerini Listele
  // ──────────────────────────────────────────────────────────────────────────
  async findMyRequests(userId: string) {
    await this.expireStaleRequests();

    const requests = await this.prisma.sellRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        bids: {
          select: { id: true, amount: true, note: true, createdAt: true },
          orderBy: { amount: 'desc' },
        },
        winningDealer: { select: { id: true, name: true, companyName: true } },
      },
    });

    // Anonim bid: dealer bilgisini gizle, sıra numarası ver
    return requests.map((r) => ({
      ...r,
      bids: r.bids.map((bid, i) => ({
        id:         bid.id,
        amount:     bid.amount,
        note:       bid.note,
        createdAt:  bid.createdAt,
        dealerTag:  `Bayi #${i + 1}`,   // Müşteri sadece bunu görür
      })),
    }));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Müşteri: Tekil talep detayı
  // ──────────────────────────────────────────────────────────────────────────
  async findMyRequest(userId: string, id: string) {
    await this.expireStaleRequests();

    const req = await this.prisma.sellRequest.findFirst({
      where: { id, userId },
      include: {
        bids: {
          select: { id: true, amount: true, note: true, createdAt: true },
          orderBy: { amount: 'desc' },
        },
        winningDealer: { select: { id: true, name: true, companyName: true } },
      },
    });

    if (!req) throw new NotFoundException('Satış talebi bulunamadı.');

    // Anonim bid
    return {
      ...req,
      bids: req.bids.map((bid, i) => ({
        id:        bid.id,
        amount:    bid.amount,
        note:      bid.note,
        createdAt: bid.createdAt,
        dealerTag: `Bayi #${i + 1}`,
      })),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Müşteri: Teklifi Kabul Et (ACCEPTED)
  // ──────────────────────────────────────────────────────────────────────────
  async acceptBid(userId: string, requestId: string, bidId: string) {
    const req = await this.prisma.sellRequest.findFirst({
      where: { id: requestId, userId },
      include: {
        user: { select: { id: true, email: true, name: true } },
        bids: { include: { dealer: true } },
      },
    });

    if (!req) throw new NotFoundException('Satış talebi bulunamadı.');
    if (req.status !== SellRequestStatus.EXPIRED && req.status !== SellRequestStatus.PENDING) {
      throw new BadRequestException('Bu talep artık teklif kabul etme aşamasında değil.');
    }

    const bid = req.bids.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException('Teklif bulunamadı.');

    const updated = await this.prisma.sellRequest.update({
      where: { id: requestId },
      data: {
        status:          SellRequestStatus.ACCEPTED,
        finalPrice:      bid.amount,
        winningDealerId: bid.dealerId,
      },
    });

    // Kazanan bayiye bildirim
    this.mail.sendBidWon({
      dealerEmail: bid.dealer.email,
      dealerName:  bid.dealer.name ?? bid.dealer.email,
      requestId,
      deviceName:  `${req.brand} ${req.model}`,
      amount:      Number(bid.amount),
    }).catch(() => {});

    // Müşteriye kargo bilgisi emaili
    this.mail.sendSellRequestAccepted({
      buyerEmail: req.user?.email ?? '',
      buyerName:  req.user?.name ?? 'Müşteri',
      requestId,
      deviceName: `${req.brand} ${req.model}`,
      amount:     Number(bid.amount),
    }).catch(() => {});

    return updated;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Müşteri: Tüm teklifleri reddet (REJECTED)
  // ──────────────────────────────────────────────────────────────────────────
  async rejectAllBids(userId: string, requestId: string) {
    const req = await this.prisma.sellRequest.findFirst({ where: { id: requestId, userId } });
    if (!req) throw new NotFoundException('Satış talebi bulunamadı.');
    if (req.status !== SellRequestStatus.EXPIRED && req.status !== SellRequestStatus.PENDING) {
      throw new BadRequestException('Bu talep artık güncel değil.');
    }

    return this.prisma.sellRequest.update({
      where: { id: requestId },
      data: { status: SellRequestStatus.REJECTED },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Müşteri: Kargo Kodunu Gir (SHIPPED)
  // ──────────────────────────────────────────────────────────────────────────
  async addShippingCode(userId: string, requestId: string, shippingCode: string) {
    const req = await this.prisma.sellRequest.findFirst({ where: { id: requestId, userId } });
    if (!req) throw new NotFoundException();
    if (req.status !== SellRequestStatus.ACCEPTED) {
      throw new BadRequestException('Sadece kabul edilmiş taleplere kargo kodu girilebilir.');
    }

    return this.prisma.sellRequest.update({
      where: { id: requestId },
      data: { status: SellRequestStatus.SHIPPED, shippingCode },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Bayi: Aktif Satış Taleplerini Gör
  // ──────────────────────────────────────────────────────────────────────────
  async findActiveForDealer(dealerId: string) {
    await this.expireStaleRequests();

    // Aktif taleplerle birlikte, bayinin kendi teklifini de getir
    const requests = await this.prisma.sellRequest.findMany({
      where: {
        status:        { in: [SellRequestStatus.PENDING, SellRequestStatus.EXPIRED] },
        adminApproved: true,   // Admin onaylanmış olanları göster
      },
      orderBy: { createdAt: 'desc' },
      include: {
        bids: {
          where: { dealerId },
          select: { id: true, amount: true, note: true, createdAt: true },
        },
        // Müşteri kimliğini GİZLE — sadece cihaz bilgisi göster
        _count: { select: { bids: true } },
      },
    });

    // Kapalı teklif: bids alanına sadece bu bayinin kendi teklifini koy
    return requests.map((r) => ({
      ...r,
      myBid:     r.bids[0] ?? null,  // Bu bayinin teklifi (varsa)
      bids:      undefined,           // Diğer bayilerin tekliflerini gizle
      bidCount:  r._count.bids,       // Kaç teklif geldiğini göster (opsiyonel)
      _count:    undefined,
    }));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Bayi: Tekil talep detayı
  // ──────────────────────────────────────────────────────────────────────────
  async findRequestForDealer(dealerId: string, id: string) {
    await this.expireStaleRequests();

    const req = await this.prisma.sellRequest.findUnique({
      where: { id },
      include: {
        bids: {
          where: { dealerId },
          select: { id: true, amount: true, note: true, createdAt: true },
        },
        _count: { select: { bids: true } },
      },
    });

    if (!req) throw new NotFoundException('Talep bulunamadı.');

    return {
      ...req,
      myBid:    req.bids[0] ?? null,
      bids:     undefined,
      bidCount: req._count.bids,
      _count:   undefined,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Bayi: Teklif Ver / Güncelle
  // ──────────────────────────────────────────────────────────────────────────
  async placeBid(dealerId: string, requestId: string, dto: PlaceBidDto) {
    await this.expireStaleRequests();

    const req = await this.prisma.sellRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Talep bulunamadı.');
    if (req.status !== SellRequestStatus.PENDING) {
      throw new BadRequestException('Bu talep için teklif süresi dolmuş veya talep aktif değil.');
    }
    if (new Date() > req.expiresAt) {
      throw new BadRequestException('Teklif süresi dolmuş.');
    }

    // ── Bakiye Kontrolü ─────────────────────────────────────────────────────
    const dealer = await this.prisma.user.findUnique({
      where: { id: dealerId },
      select: { walletBalance: true, isActive: true },
    });
    if (!dealer || !dealer.isActive) {
      throw new ForbiddenException('Hesabınız aktif değil.');
    }
    if (!dealer.walletBalance || Number(dealer.walletBalance) <= 0) {
      throw new ForbiddenException(
        'Teklif vermek için bakiye yüklemeniz gerekiyor. Lütfen admin ile iletişime geçin.',
      );
    }

    // Upsert: aynı bayi aynı talebi güncelleyebilir
    const bid = await this.prisma.sellRequestBid.upsert({
      where: { sellRequestId_dealerId: { sellRequestId: requestId, dealerId } },
      update: { amount: dto.amount, note: dto.note, updatedAt: new Date() },
      create: { sellRequestId: requestId, dealerId, amount: dto.amount, note: dto.note },
    });

    this.logger.log(`Bayi ${dealerId} → SellRequest ${requestId} → ₺${dto.amount}`);
    return bid;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Tüm Satış Taleplerini Listele
  // ──────────────────────────────────────────────────────────────────────────
  async findAll(opts?: { status?: SellRequestStatus; skip?: number; take?: number }) {
    await this.expireStaleRequests();

    const where = opts?.status ? { status: opts.status } : {};

    const [items, total] = await Promise.all([
      this.prisma.sellRequest.findMany({
        where,
        skip: opts?.skip ?? 0,
        take: opts?.take ?? 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, name: true } },
          bids: {
            orderBy: { amount: 'desc' },
            include: {
              dealer: { select: { id: true, email: true, name: true, companyName: true } },
            },
          },
          winningDealer: { select: { id: true, email: true, name: true, companyName: true } },
          _count: { select: { bids: true } },
        },
      }),
      this.prisma.sellRequest.count({ where }),
    ]);

    return { items, total };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Tekil talep tam detay
  // ──────────────────────────────────────────────────────────────────────────
  async findOneAdmin(id: string) {
    const req = await this.prisma.sellRequest.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        bids: {
          orderBy: { amount: 'desc' },
          include: {
            dealer: { select: { id: true, email: true, name: true, companyName: true } },
          },
        },
        winningDealer: { select: { id: true, email: true, name: true, companyName: true } },
      },
    });
    if (!req) throw new NotFoundException();
    return req;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: Durum / Fiyat / Atama Güncelle
  // ──────────────────────────────────────────────────────────────────────────
  async updateAdmin(id: string, dto: UpdateSellRequestDto) {
    const req = await this.prisma.sellRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException();

    return this.prisma.sellRequest.update({
      where: { id },
      data: {
        ...(dto.status          !== undefined && { status:          dto.status }),
        ...(dto.finalPrice      !== undefined && { finalPrice:      dto.finalPrice }),
        ...(dto.winningDealerId !== undefined && { winningDealerId: dto.winningDealerId }),
        ...(dto.shippingCode    !== undefined && { shippingCode:    dto.shippingCode }),
        ...(dto.adminNote       !== undefined && { adminNote:       dto.adminNote }),
      },
      include: {
        user:          { select: { id: true, email: true, name: true } },
        bids:          { include: { dealer: { select: { id: true, email: true, name: true } } } },
        winningDealer: { select: { id: true, email: true, name: true } },
      },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin: İstatistikler
  // ──────────────────────────────────────────────────────────────────────────
  async getStats() {
    const [total, pending, expired, accepted, completed, rejected, totalBids] = await Promise.all([
      this.prisma.sellRequest.count(),
      this.prisma.sellRequest.count({ where: { status: SellRequestStatus.PENDING } }),
      this.prisma.sellRequest.count({ where: { status: SellRequestStatus.EXPIRED } }),
      this.prisma.sellRequest.count({ where: { status: { in: [SellRequestStatus.ACCEPTED, SellRequestStatus.SHIPPED, SellRequestStatus.RECEIVED] } } }),
      this.prisma.sellRequest.count({ where: { status: SellRequestStatus.COMPLETED } }),
      this.prisma.sellRequest.count({ where: { status: SellRequestStatus.REJECTED } }),
      this.prisma.sellRequestBid.count(),
    ]);

    const avgBids = total > 0 ? (totalBids / total).toFixed(1) : '0';

    return { total, pending, expired, accepted, completed, rejected, totalBids, avgBids };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PUBLIC: Scheduler & manuel tetikleme için birleşik expire işlemi
  // ──────────────────────────────────────────────────────────────────────────
  async runScheduledExpiry(): Promise<void> {
    // 1. Adım: Süresi dolmuş PENDING talepleri bul (email için data'yı önceden al)
    const candidates = await this.prisma.sellRequest.findMany({
      where: {
        status:    SellRequestStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      include: {
        user: { select: { email: true, name: true } },
        bids: { orderBy: { amount: 'desc' }, take: 1 },
      },
    });

    if (candidates.length === 0) return;

    // 2. Adım: Tamamını EXPIRED'a al (batch update)
    await this.prisma.sellRequest.updateMany({
      where: { id: { in: candidates.map((r) => r.id) } },
      data:  { status: SellRequestStatus.EXPIRED },
    });

    this.logger.log(`[Scheduler] ${candidates.length} talep EXPIRED'a alındı.`);

    // 3. Adım: Her müşteriye "teklifler kapandı" emaili gönder
    for (const req of candidates) {
      const bestOffer = req.bids[0] ? Number(req.bids[0].amount) : null;
      this.mail.sendAuctionExpired({
        buyerEmail:  req.user.email,
        buyerName:   req.user.name ?? req.user.email,
        requestId:   req.id,
        deviceName:  `${req.brand} ${req.model}`,
        bestOffer,
        bidCount:    req.bids.length,
      }).catch((err) => {
        this.logger.warn(`[Scheduler] Email gönderilemedi (${req.id}): ${err?.message}`);
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PRIVATE: Endpoint çağrılarında anlık expire kontrolü (eski uyumluluk)
  // ──────────────────────────────────────────────────────────────────────────
  private async expireStaleRequests() {
    // Scheduler yokken ya da elle endpoint geldiğinde hızlıca günceller
    // (email göndermez — scheduler zaten halleder)
    await this.prisma.sellRequest.updateMany({
      where: {
        status:    SellRequestStatus.PENDING,
        expiresAt: { lt: new Date() },
      },
      data: { status: SellRequestStatus.EXPIRED },
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Yardımcı: Tüm Onaylı Bayilere Yeni Talep Bildirimi
  // ──────────────────────────────────────────────────────────────────────────
  private async notifyAllDealers(requestId: string, deviceName: string, grade: string) {
    const dealers = await this.prisma.user.findMany({
      where: { role: Role.DEALER, isActive: true },
      select: { email: true, name: true },
      take: 500, // Güvenlik sınırı
    });

    for (const dealer of dealers) {
      this.mail.sendDealerNewSellRequest({
        dealerEmail: dealer.email,
        dealerName:  dealer.name ?? dealer.email,
        requestId,
        deviceName,
        grade,
      }).catch(() => {});
    }

    this.logger.log(`Yeni talep (${requestId}) → ${dealers.length} bayiye bildirim gönderildi.`);
  }
}
