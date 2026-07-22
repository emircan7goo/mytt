import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ApplicationStatus, Role, PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private prisma: PrismaService,
    private mail:   MailService,
  ) {}

  // â”€â”€ Activity Log YardÄ±mcÄ±sÄ± â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /**
   * TÃ¼m admin aksiyonlarÄ±nÄ± veritabanÄ±na loglar.
   * Hata olursa esas iÅŸlemi engellemez â€” sadece log'a yazar.
   */
  async logActivity(
    adminId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    meta?: any,
  ): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: { adminId, action, entityType, entityId, meta },
      });
    } catch (err) {
      this.logger.error(`ActivityLog yazÄ±lamadÄ±: ${action}`, err);
    }
  }

  // â”€â”€ Bayi BaÅŸvuru YÃ¶netimi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async getPendingDealerApplications() {
    return this.prisma.dealerApplication.findMany({
      where: { status: ApplicationStatus.PENDING },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateDealerApplicationStatus(id: string, status: ApplicationStatus, adminId?: string) {
    const application = await this.prisma.dealerApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('BaÅŸvuru bulunamadÄ±');

    const newRole = status === ApplicationStatus.APPROVED ? Role.DEALER : Role.CUSTOMER;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedApp = await tx.dealerApplication.update({
        where: { id },
        data: { status },
      });
      await tx.user.update({
        where: { id: application.userId },
        data: {
          role: newRole,
          b2bStatus: status,
          // OnaylanÄ±nca varsayÄ±lan %5 bayi komisyon indirimi ver
          ...(status === ApplicationStatus.APPROVED && { commissionRate: 0.05 }),
        },
      });

      // OnaylanÄ±nca otomatik maÄŸaza oluÅŸtur (yoksa) â€” addDealerStock iÃ§in zorunlu
      if (status === ApplicationStatus.APPROVED) {
        const existing = await tx.store.findUnique({ where: { ownerId: application.userId } });
        if (!existing) {
          await tx.store.create({
            data: {
              ownerId: application.userId,
              name:    application.companyName,
            },
          });
        }
      }

      return updatedApp;
    });

    // Email bildirimi (transaction dÄ±ÅŸÄ±nda â€” hata olsa iÅŸlem geri alÄ±nmasÄ±n)
    const userInfo = await this.prisma.user.findUnique({
      where:  { id: application.userId },
      select: { email: true, name: true },
    });

    if (userInfo) {
      if (status === ApplicationStatus.APPROVED) {
        void this.mail.sendDealerApproved({
          email:       userInfo.email,
          name:        userInfo.name ?? userInfo.email,
          companyName: application.companyName,
        });
      } else if (status === ApplicationStatus.REJECTED) {
        void this.mail.sendDealerRejected({
          email: userInfo.email,
          name:  userInfo.name ?? userInfo.email,
        });
      }
    }

    // Activity log
    if (adminId) {
      const action = status === ApplicationStatus.APPROVED ? 'APPROVE_DEALER' : 'REJECT_DEALER';
      await this.logActivity(adminId, action, 'DealerApplication', id, {
        userId: application.userId,
        companyName: application.companyName,
        status,
      });
    }

    return result;
  }

  // â”€â”€ Platform Metrikleri â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getPlatformMetrics() {
    const [totalUsers, totalDealers, totalOrders, totalProducts, pendingKyc, openTickets] =
      await Promise.all([
        this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
        this.prisma.user.count({ where: { role: Role.DEALER } }),
        this.prisma.order.count(),
        this.prisma.dealerStock.count(),
        this.prisma.dealerApplication.count({ where: { status: ApplicationStatus.PENDING } }),
        this.prisma.ticket.count({ where: { status: 'OPEN' } }),
      ]);

    const gmvResult = await this.prisma.order.aggregate({ _sum: { amount: true } });
    const avgResult = await this.prisma.order.aggregate({ _avg: { amount: true } });

    const gmv = Number(gmvResult._sum.amount ?? 0);
    const commission = gmv * 0.05;
    const avgOrderValue = Number(avgResult._avg.amount ?? 0);

    // Son 30 gÃ¼nlÃ¼k sipariÅŸ sayÄ±sÄ±
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await this.prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    return {
      totalUsers,
      totalDealers,
      totalOrders,
      totalProducts,
      pendingKyc,
      openTickets,
      gmv,
      commission,
      avgOrderValue,
      recentOrders,
    };
  }

  // â”€â”€ Bayi Analitik â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getDealerAnalytics() {
    const [dealers, revenueGroups] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.DEALER },
        select: {
          id: true, name: true, email: true, companyName: true,
          commissionRate: true, isActive: true, createdAt: true,
          store: {
            select: {
              name: true,
              _count: { select: { dealerStock: true } },
              dealerStock: {
                select: { createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          _count: {
            select: {
              ordersAsSeller: true,
              tickets: { where: { status: 'OPEN' } },
            },
          },
          ordersAsSeller: {
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.groupBy({
        by: ['sellerId'],
        _sum: { amount: true },
      }),
    ]);

    const revenueMap = new Map(
      revenueGroups.map((r) => [r.sellerId, Number(r._sum.amount ?? 0)]),
    );

    const now = Date.now();

    return dealers.map((d) => {
      const lastStock = d.store?.dealerStock[0] ?? null;
      const lastOrder = d.ordersAsSeller[0] ?? null;
      const daysSinceLastStock = lastStock
        ? Math.floor((now - new Date(lastStock.createdAt).getTime()) / 86_400_000)
        : null;

      return {
        id: d.id, name: d.name, email: d.email, companyName: d.companyName,
        storeName: d.store?.name ?? '-',
        isActive: d.isActive, joinedAt: d.createdAt, commissionRate: d.commissionRate,
        totalStock: d.store?._count.dealerStock ?? 0,
        totalOrders: d._count.ordersAsSeller,
        totalRevenue: revenueMap.get(d.id) ?? 0,
        openTickets: d._count.tickets,
        lastStockDate: lastStock?.createdAt ?? null,
        lastOrderDate: lastOrder?.createdAt ?? null,
        daysSinceLastStock,
        isInactive: daysSinceLastStock !== null && daysSinceLastStock >= 10,
        hasNoStock: (d.store?._count.dealerStock ?? 0) === 0,
      };
    });
  }

  // â”€â”€ TÃ¼m KullanÄ±cÄ±larÄ± Listele (Yeni) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  /**
   * Admin: TÃ¼m mÃ¼ÅŸteri ve bayileri listeler.
   * Frontend'deki mock data'nÄ±n yerini alÄ±r.
   */
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      where: { role: { in: [Role.CUSTOMER, Role.DEALER] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        b2bStatus: true,
        commissionRate: true,
        companyName: true,
        createdAt: true,
        _count: {
          select: { ordersAsBuyer: true },
        },
        ordersAsSeller: {
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name ?? u.email.split('@')[0],
      email: u.email,
      role: u.role.toLowerCase() as 'customer' | 'dealer',
      isActive: u.isActive,
      b2bStatus: u.b2bStatus,
      commissionRate: u.commissionRate,
      companyName: u.companyName,
      joinedAt: u.createdAt,
      totalOrders: u._count.ordersAsBuyer,
      totalRevenue: u.ordersAsSeller.reduce((sum, o) => sum + Number(o.amount), 0),
      // Frontend ile uyumlu status alanÄ±
      status: !u.isActive
        ? 'banned'
        : u.b2bStatus === 'PENDING'
          ? 'pending_kyc'
          : 'active',
    }));
  }

  /**
   * Admin: Bayi komisyon oranÄ±nÄ± gÃ¼nceller
   */
  async updateUserCommission(userId: string, commissionRate: number, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('KullanÄ±cÄ± bulunamadÄ±');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { commissionRate: commissionRate / 100 }, // Frontend'den % olarak gelir, ondalÄ±ÄŸa Ã§evir
      select: { id: true, email: true, name: true, commissionRate: true, isActive: true, b2bStatus: true },
    });

    await this.logActivity(adminId, 'UPDATE_COMMISSION', 'User', userId, {
      oldRate: user.commissionRate,
      newRate: commissionRate / 100,
    });

    return updated;
  }

  /**
   * Admin: KullanÄ±cÄ±yÄ± banla / aktif et
   */
  async toggleUserBan(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('KullanÄ±cÄ± bulunamadÄ±');

    const newStatus = !user.isActive;
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
      select: { id: true, email: true, name: true, isActive: true, role: true, b2bStatus: true },
    });

    await this.logActivity(adminId, newStatus ? 'UNBAN_USER' : 'BAN_USER', 'User', userId, {
      email: user.email,
    });

    return updated;
  }

  // â”€â”€ Ticket YÃ¶netimi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getAllTickets() {
    return this.prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dealer: {
          select: { id: true, name: true, email: true, companyName: true },
        },
      },
    });
  }

  async replyToTicket(ticketId: string, adminReply: string, adminId?: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Talep bulunamadÄ±');

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        adminReply,
        status: 'IN_PROGRESS',
        repliedAt: new Date(),
      },
    });

    if (adminId) {
      await this.logActivity(adminId, 'REPLY_TICKET', 'Ticket', ticketId);
    }

    return updated;
  }

  async closeTicket(ticketId: string, adminId?: string) {
    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' },
    });

    if (adminId) {
      await this.logActivity(adminId, 'CLOSE_TICKET', 'Ticket', ticketId);
    }

    return updated;
  }

  // â”€â”€ AnlaÅŸmazlÄ±k YÃ¶netimi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getDisputes() {
    return this.prisma.order.findMany({
      where: {
        OR: [
          { paymentStatus: 'REFUNDED' },
          { disputeStatus: { not: null } },
        ],
      },
      select: {
        id: true, amount: true, paymentStatus: true,
        disputeStatus: true, disputeType: true, disputeNote: true,
        createdAt: true, updatedAt: true,
        buyer: { select: { name: true, email: true } },
        seller: { select: { name: true, email: true, companyName: true } },
        product: { select: { brand: true, model: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateDisputeStatus(
    orderId: string,
    disputeStatus: string,
    disputeNote?: string,
    adminId?: string,
  ) {
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { disputeStatus, ...(disputeNote && { disputeNote }) },
    });

    if (adminId) {
      await this.logActivity(adminId, 'RESOLVE_DISPUTE', 'Order', orderId, {
        disputeStatus,
        disputeNote,
      });
    }

    return updated;
  }

  async openDispute(orderId: string, disputeType: string, disputeNote?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('SipariÅŸ bulunamadÄ±');
    return this.prisma.order.update({
      where: { id: orderId },
      data: { disputeStatus: 'OPEN', disputeType, disputeNote },
    });
  }

  // â”€â”€ Aktivite Logu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getActivityLogs() {
    return this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // â”€â”€ TÃ¼m SipariÅŸler (Admin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        product: {
          select: { brand: true, model: true, imagesUrl: true },
        },
        dealerStock: {
          select: {
            price: true, grade: true,
            globalProduct: { select: { brand: true, model: true, storage: true } },
          },
        },
        // AlÄ±cÄ±: yalnÄ±zca ID ve isim â€” email gizli
        buyer:  { select: { id: true, name: true } },
        // SatÄ±cÄ±: maÄŸaza adÄ± yeterli â€” kiÅŸisel bilgi gizli
        seller: { select: { id: true, name: true, companyName: true } },
      },
    });
  }

  // â”€â”€ SipariÅŸ Durumu GÃ¼ncelle (Admin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async updateOrderStatus(orderId: string, paymentStatus: string, adminId: string) {
    const valid = Object.values(PaymentStatus) as string[];
    if (!valid.includes(paymentStatus)) {
      throw new BadRequestException(`Geçersiz ödeme durumu: ${paymentStatus}`);
    }
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data:  { paymentStatus: paymentStatus as PaymentStatus },
    });
    await this.logActivity(adminId, `ORDER_STATUS_CHANGE:${paymentStatus}`, 'Order', orderId, { paymentStatus });
    return order;
  }

  // â”€â”€ Bayi Bakiye YÃ¶netimi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Bayi bakiyesini set veya artÄ±r: `mode=set` kesin rakam, `mode=add` Ã¼zerine ekle.
   */
  async updateDealerWallet(
    dealerId: string,
    amount: number,
    mode: 'set' | 'add' = 'set',
    adminId?: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: dealerId } });
    if (!user) throw new NotFoundException('Bayi bulunamadÄ±.');

    const oldBalance = Number(user.walletBalance ?? 0);
    const newBalance = mode === 'add' ? oldBalance + amount : amount;

    const updated = await this.prisma.user.update({
      where: { id: dealerId },
      data:  { walletBalance: newBalance },
      select: { id: true, name: true, email: true, companyName: true, walletBalance: true },
    });

    if (adminId) {
      await this.logActivity(adminId, 'UPDATE_DEALER_WALLET', 'User', dealerId, {
        oldBalance, newBalance, mode, amount,
      });
    }

    return updated;
  }

  /**
   * Bayi listesi â€” bakiye bilgisi dahil
   */
  async getDealersWithWallet() {
    return this.prisma.user.findMany({
      where: { role: Role.DEALER },
      select: {
        id: true, name: true, email: true, companyName: true,
        isActive: true, walletBalance: true, commissionRate: true,
        createdAt: true,
        store: { select: { name: true, _count: { select: { dealerStock: true } } } },
        _count: { select: { ordersAsSeller: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Onay Merkezi ─────────────────────────────────────────────────────────────

  /** Tüm onay bekleyenleri tek seferde döndür */
  async getPendingApprovals() {
    const [sellRequests, dealerStocks, dealerMarketItems, payoutRequests] = await Promise.all([
      // Müşteri satış talepleri — admin onayı bekliyor
      this.prisma.sellRequest.findMany({
        where: { adminApproved: false, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      // Bayi stok girişleri — admin onayı bekliyor
      this.prisma.dealerStock.findMany({
        where: { adminApproved: false },
        orderBy: { createdAt: 'desc' },
        include: {
          globalProduct: true,
          store: { include: { owner: { select: { id: true, name: true, email: true, companyName: true } } } },
        },
      }),
      // Bayi paslaşma ilanları — admin onayı bekliyor
      this.prisma.dealerMarketItem.findMany({
        where: { status: 'PENDING_ADMIN' },
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: { id: true, name: true, email: true, companyName: true } } },
      }),
      // Bayi hakediş çekim talepleri — admin onayı bekliyor
      this.prisma.payout.findMany({
        where: { status: 'PENDING' },
        orderBy: { requestedAt: 'desc' },
        include: { dealer: { select: { id: true, name: true, email: true, companyName: true } } },
      }),
    ]);

    return {
      sellRequests,
      dealerStocks,
      dealerMarketItems,
      payoutRequests,
      totalCount: sellRequests.length + dealerStocks.length + dealerMarketItems.length + payoutRequests.length,
    };
  }

  /** Müşteri satış talebini onayla — bayiler teklif verebilir */
  async approveSellRequest(id: string, adminNote: string | undefined, adminId: string) {
    const req = await this.prisma.sellRequest.findUnique({ where: { id } });
    if (!req) throw new Error('Satış talebi bulunamadı');

    const updated = await this.prisma.sellRequest.update({
      where: { id },
      data: {
        adminApproved: true,
        approvedAt:    new Date(),
        adminNote:     adminNote ?? undefined,
      },
    });

    await this.logActivity(adminId, 'APPROVE_SELL_REQUEST', 'SellRequest', id, { adminNote });
    return updated;
  }

  /** Müşteri satış talebini reddet */
  async rejectSellRequest(id: string, adminNote: string | undefined, adminId: string) {
    const req = await this.prisma.sellRequest.findUnique({ where: { id } });
    if (!req) throw new Error('Satış talebi bulunamadı');

    const updated = await this.prisma.sellRequest.update({
      where: { id },
      data: {
        adminApproved: false,
        status:        'CANCELLED',
        adminNote:     adminNote ?? 'Admin tarafından reddedildi.',
      },
    });

    await this.logActivity(adminId, 'REJECT_SELL_REQUEST', 'SellRequest', id, { adminNote });
    return updated;
  }

  /** Bayi stok girişini onayla — marketplace'de görünür */
  async approveDealerStock(id: string, adminNote: string | undefined, adminId: string) {
    const stock = await this.prisma.dealerStock.findUnique({ where: { id } });
    if (!stock) throw new Error('Stok girişi bulunamadı');

    const updated = await this.prisma.dealerStock.update({
      where: { id },
      data: {
        adminApproved: true,
        approvedAt:    new Date(),
        adminNote:     adminNote ?? undefined,
      },
    });

    await this.logActivity(adminId, 'APPROVE_DEALER_STOCK', 'DealerStock', id, { adminNote });
    return updated;
  }

  /** Bayi stok girişini reddet */
  async rejectDealerStock(id: string, adminNote: string | undefined, adminId: string) {
    const stock = await this.prisma.dealerStock.findUnique({ where: { id } });
    if (!stock) throw new Error('Stok girişi bulunamadı');

    const updated = await this.prisma.dealerStock.update({
      where: { id },
      data: {
        adminApproved: false,
        adminNote:     adminNote ?? 'Admin tarafından reddedildi.',
      },
    });

    await this.logActivity(adminId, 'REJECT_DEALER_STOCK', 'DealerStock', id, { adminNote });
    return updated;
  }
}
