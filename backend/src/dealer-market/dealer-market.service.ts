/**
 * DealerMarketService — Bayiler Arası Cihaz Paslaşma
 *
 * Akış:
 *  1. Bayi cihazı listeler → PENDING_ADMIN
 *  2. Admin onaylar → ACTIVE + expiresAt hesaplanır (AUCTION ise)
 *  3. Diğer bayiler teklif verir (AUCTION) veya direkt satın alır (DIRECT)
 *  4. AUCTION: süre dolunca EXPIRED → satıcı kazananı seçer veya sistem en yükseği alır
 *  5. DIRECT: "Satın Al" → anında SOLD
 */
import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, DealerListingTypeDto } from './dto/create-listing.dto';
import { PlaceMarketBidDto } from './dto/place-market-bid.dto';
import { DealerMarketStatus, Role } from '@prisma/client';

@Injectable()
export class DealerMarketService {
  private readonly logger = new Logger(DealerMarketService.name);

  constructor(private prisma: PrismaService) {}

  // ── Bayi: Yeni Listeleme ──────────────────────────────────────────────────
  async createListing(sellerId: string, dto: CreateListingDto) {
    // Satıcı bakiye kontrolü
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { walletBalance: true, isActive: true, role: true },
    });
    if (!seller || !seller.isActive) throw new ForbiddenException('Hesabınız aktif değil.');
    if (seller.role !== Role.DEALER) throw new ForbiddenException('Sadece bayiler listeleyebilir.');

    const item = await this.prisma.dealerMarketItem.create({
      data: {
        sellerId,
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
        images:         dto.images,
        listingType:    dto.listingType as any,
        floorPrice:     dto.floorPrice,
        directPrice:    dto.directPrice,
        durationHours:  dto.durationHours ?? 1,
        status:         DealerMarketStatus.PENDING_ADMIN,
      },
    });

    this.logger.log(`Yeni listeleme oluşturuldu: ${item.id} (${dto.brand} ${dto.model}) — Admin onayı bekleniyor`);
    return item;
  }

  // ── Bayi: Kendi Listelemeleri ─────────────────────────────────────────────
  async findMyListings(sellerId: string) {
    return this.prisma.dealerMarketItem.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        bids: {
          where: { bidderId: { not: sellerId } },
          select: {
            id: true, amount: true, note: true, createdAt: true,
            bidder: { select: { id: true, name: true, companyName: true } },
          },
          orderBy: { amount: 'desc' },
        },
        _count: { select: { bids: true } },
      },
    });
  }

  // ── Bayi: Aktif Marketplace Listesi ──────────────────────────────────────
  async findActiveListings(dealerId: string) {
    await this.expireStaleListings();

    const items = await this.prisma.dealerMarketItem.findMany({
      where: {
        status:       DealerMarketStatus.ACTIVE,
        adminApproved: true,
        sellerId:      { not: dealerId }, // Kendi listelemelerini görmez
      },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, companyName: true, name: true } },
        bids: {
          where: { bidderId: dealerId },
          select: { id: true, amount: true, note: true, createdAt: true },
        },
        _count: { select: { bids: true } },
      },
    });

    return items.map((item) => ({
      ...item,
      myBid:    item.bids[0] ?? null,
      bids:     undefined, // Diğer teklifleri gizle
      bidCount: item._count.bids,
      _count:   undefined,
    }));
  }

  // ── Bayi: Teklif Ver / Güncelle ───────────────────────────────────────────
  async placeBid(dealerId: string, itemId: string, dto: PlaceMarketBidDto) {
    await this.expireStaleListings();

    const item = await this.prisma.dealerMarketItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('İlan bulunamadı.');
    if (item.sellerId === dealerId) throw new ForbiddenException('Kendi ilanınıza teklif veremezsiniz.');
    if (item.status !== DealerMarketStatus.ACTIVE) {
      throw new BadRequestException('Bu ilan artık aktif değil.');
    }
    if (item.listingType === 'DIRECT') {
      throw new BadRequestException('Sabit fiyatlı ilana teklif verilemez. "Satın Al" kullanın.');
    }
    if (item.expiresAt && new Date() > item.expiresAt) {
      throw new BadRequestException('Teklif süresi dolmuş.');
    }
    if (dto.amount < Number(item.floorPrice)) {
      throw new BadRequestException(`Teklif taban fiyatın altında olamaz. Min: ₺${item.floorPrice}`);
    }

    // Bakiye kontrolü
    const dealer = await this.prisma.user.findUnique({
      where: { id: dealerId },
      select: { walletBalance: true, isActive: true },
    });
    if (!dealer?.isActive) throw new ForbiddenException('Hesabınız aktif değil.');
    if (Number(dealer.walletBalance ?? 0) <= 0) {
      throw new ForbiddenException('Teklif vermek için bakiye yüklemeniz gerekiyor.');
    }

    const bid = await this.prisma.dealerMarketBid.upsert({
      where: { itemId_bidderId: { itemId, bidderId: dealerId } },
      update: { amount: dto.amount, note: dto.note, updatedAt: new Date() },
      create: { itemId, bidderId: dealerId, amount: dto.amount, note: dto.note },
    });

    this.logger.log(`Teklif: Bayi ${dealerId} → İlan ${itemId} → ₺${dto.amount}`);
    return bid;
  }

  // ── Bayi: DIRECT ile Satın Al ─────────────────────────────────────────────
  async buyDirect(dealerId: string, itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.dealerMarketItem.findUnique({ where: { id: itemId } });
      if (!item) throw new NotFoundException('İlan bulunamadı.');
      if (item.sellerId === dealerId) throw new ForbiddenException('Kendi ilanınızı satın alamazsınız.');
      if (item.status !== DealerMarketStatus.ACTIVE) throw new BadRequestException('Bu ilan aktif değil.');
      if (item.listingType !== 'DIRECT') throw new BadRequestException('Bu ilan sabit fiyatlı değil.');
      if (!item.directPrice) throw new BadRequestException('Fiyat belirtilmemiş.');

      const dealer = await tx.user.findUnique({
        where: { id: dealerId },
        select: { walletBalance: true, isActive: true },
      });
      if (!dealer?.isActive) throw new ForbiddenException('Hesabınız aktif değil.');
      if (Number(dealer.walletBalance ?? 0) <= 0) {
        throw new ForbiddenException('Satın almak için bakiye yüklemeniz gerekiyor.');
      }

      return tx.dealerMarketItem.update({
        where: { id: itemId },
        data: {
          status:          DealerMarketStatus.SOLD,
          winningBidderId: dealerId,
          finalPrice:      item.directPrice,
        },
      });
    });
  }

  // ── Satıcı Bayi: Teklifi Kabul Et (AUCTION → SOLD) ───────────────────────
  async acceptBid(sellerId: string, itemId: string, bidId: string) {
    const item = await this.prisma.dealerMarketItem.findUnique({
      where: { id: itemId },
      include: { bids: true },
    });
    if (!item) throw new NotFoundException('İlan bulunamadı.');
    if (item.sellerId !== sellerId) throw new ForbiddenException('Bu ilan size ait değil.');
    if (item.status !== DealerMarketStatus.ACTIVE && item.status !== DealerMarketStatus.EXPIRED) {
      throw new BadRequestException('Bu işlem için ilan durumu uygun değil.');
    }

    const bid = item.bids.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException('Teklif bulunamadı.');

    return this.prisma.dealerMarketItem.update({
      where: { id: itemId },
      data: {
        status:          DealerMarketStatus.SOLD,
        winningBidderId: bid.bidderId,
        finalPrice:      bid.amount,
      },
    });
  }

  // ── Satıcı Bayi: İlanı İptal Et ──────────────────────────────────────────
  async cancelListing(sellerId: string, itemId: string) {
    const item = await this.prisma.dealerMarketItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException();
    if (item.sellerId !== sellerId) throw new ForbiddenException('Bu ilan size ait değil.');
    if (item.status === DealerMarketStatus.SOLD) throw new BadRequestException('Satılmış ilan iptal edilemez.');

    return this.prisma.dealerMarketItem.update({
      where: { id: itemId },
      data: { status: DealerMarketStatus.CANCELLED },
    });
  }

  // ── Admin: Tüm İlanlar ────────────────────────────────────────────────────
  async findAll(status?: DealerMarketStatus) {
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.prisma.dealerMarketItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { id: true, email: true, name: true, companyName: true } },
          bids: {
            orderBy: { amount: 'desc' },
            include: { bidder: { select: { id: true, email: true, name: true, companyName: true } } },
          },
          _count: { select: { bids: true } },
        },
      }),
      this.prisma.dealerMarketItem.count({ where }),
    ]);
    return { items, total };
  }

  // ── Admin: Onay Ver / Reddet ──────────────────────────────────────────────
  async adminApprove(itemId: string, adminNote?: string) {
    const item = await this.prisma.dealerMarketItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException();

    const now = new Date();
    let expiresAt: Date | undefined;
    if (item.listingType === 'AUCTION') {
      expiresAt = new Date(now.getTime() + item.durationHours * 60 * 60 * 1000);
    }

    return this.prisma.dealerMarketItem.update({
      where: { id: itemId },
      data: {
        adminApproved: true,
        status:        DealerMarketStatus.ACTIVE,
        approvedAt:    now,
        adminNote:     adminNote ?? null,
        expiresAt,
      },
    });
  }

  async adminReject(itemId: string, adminNote?: string) {
    const item = await this.prisma.dealerMarketItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException();

    return this.prisma.dealerMarketItem.update({
      where: { id: itemId },
      data: {
        adminApproved: false,
        status:        DealerMarketStatus.REJECTED,
        adminNote:     adminNote ?? 'Reddedildi',
      },
    });
  }

  // ── Admin: Tekil ilan ─────────────────────────────────────────────────────
  async findOneAdmin(id: string) {
    const item = await this.prisma.dealerMarketItem.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, email: true, name: true, companyName: true } },
        bids: {
          orderBy: { amount: 'desc' },
          include: { bidder: { select: { id: true, email: true, name: true, companyName: true } } },
        },
        winningBidder: { select: { id: true, email: true, name: true, companyName: true } },
      },
    });
    if (!item) throw new NotFoundException();
    return item;
  }

  // ── Scheduler: Süresi Dolan AUCTION ilanları EXPIRED'a al ─────────────────
  async expireStaleListings() {
    const expired = await this.prisma.dealerMarketItem.updateMany({
      where: {
        status:       DealerMarketStatus.ACTIVE,
        listingType:  'AUCTION',
        expiresAt:    { lt: new Date() },
      },
      data: { status: DealerMarketStatus.EXPIRED },
    });
    if (expired.count > 0) {
      this.logger.log(`[Scheduler] ${expired.count} ilan EXPIRED'a alındı.`);
    }
  }
}
