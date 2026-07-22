import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { PaymentStatus, ShippingStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Activity Log yardımcısı ──────────────────────────────────────────────────
  private async logActivity(
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
      this.logger.error(`ActivityLog yazılamadı: ${action}`, err);
    }
  }

  /**
   * Müşteri sipariş oluşturur.
   * 1. Ürün var mı ve stok yeterli mi kontrol eder (ATOMIC)
   * 2. Satıcıyı (store owner) bulur — müşteriye açıklanmaz
   * 3. Escrow statüsünde sipariş kaydeder
   * 4. Stok atomik olarak düşürülür
   */
  async createOrder(buyerId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch product with stock and store info
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
        include: {
          store: {
            select: {
              ownerId: true, name: true,
              owner: { select: { commissionRate: true } },
            },
          },
        },
      });

      if (!product) {
        throw new NotFoundException('Ürün bulunamadı.');
      }

      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Yeterli stok yok. Mevcut stok: ${product.stock}`,
        );
      }

      if (product.store.ownerId === buyerId) {
        throw new BadRequestException('Kendi ürününüzü satın alamazsınız.');
      }

      // 2. Calculate final price (campaign price wins if active)
      const unitPrice =
        product.isOnCampaign && product.discountedPrice != null
          ? product.discountedPrice
          : product.price;

      const totalAmount = unitPrice * dto.quantity;

      // Bayinin kendi komisyon oranı — admin onayında atanır, sonra admin değiştirebilir.
      // Hiç atanmamışsa (beklenmedik durum) platform varsayılanı %5'e düş.
      const commissionRate = Number(product.store.owner.commissionRate) || 0.05;

      // 3. Create order in PENDING state (ödeme onaylanınca ESCROW'a geçer)
      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.store.ownerId,
          productId: dto.productId,
          quantity: dto.quantity,
          amount: totalAmount,
          commissionRate,
          paymentStatus: PaymentStatus.PENDING,
          shippingStatus: ShippingStatus.WAITING_DEALER_SHIPMENT,
          shippingAddress: dto.shippingAddress,
          notes: dto.notes,
        },
      });

      // 4. Decrement stock atomically
      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: { decrement: dto.quantity } },
      });

      return {
        ...order,
        // Return minimal info — seller identity stays hidden
        storeName: product.store.name,
      };
    });
  }

  /**
   * Müşteri kendi siparişlerini görür.
   * Satıcı kimliği (ownerId, email) AÇIKLANMAZ.
   */
  async getMyOrdersAsBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, brand: true, model: true, imagesUrl: true, condition: true },
        },
        dealerStock: {
          select: {
            id: true, price: true, grade: true, batteryHealth: true, dealerImages: true,
            globalProduct: { select: { brand: true, model: true, storage: true } },
          },
        },
      },
    });
  }

  /**
   * Bayi kendi aldığı siparişleri görür — buyerId gizlenir.
   */
  async getMyOrdersAsDealer(sellerId: string) {
    return this.prisma.order.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, brand: true, model: true, imagesUrl: true, stock: true },
        },
        dealerStock: {
          select: {
            id: true, price: true, grade: true, stock: true, dealerImages: true,
            globalProduct: { select: { brand: true, model: true, storage: true } },
          },
        },
      },
    });
  }

  // ── KARGO AKIŞ METODLARI ──────────────────────────────────────────────────────

  /**
   * Adım 1: Bayi kargo kodunu girer → DEALER_SHIPPED
   * Sadece siparişin sahibi bayi bu işlemi yapabilir.
   */
  async dealerUpdateTracking(orderId: string, dealerId: string, trackingCode: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');
    if (order.sellerId !== dealerId) throw new ForbiddenException('Bu sipariş size ait değil.');
    if (order.paymentStatus !== PaymentStatus.ESCROW) {
      throw new BadRequestException('Ödeme henüz onaylanmamış.');
    }
    if (order.shippingStatus !== ShippingStatus.WAITING_DEALER_SHIPMENT) {
      throw new BadRequestException(`Sipariş zaten ${order.shippingStatus} durumunda.`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus:    ShippingStatus.DEALER_SHIPPED,
        dealerTrackingCode: trackingCode,
        dealerShippedAt:   new Date(),
      },
    });
    this.logger.log(`📦 Bayi kargoladi — Sipariş: ${orderId}, Kargo: ${trackingCode}`);
    return updated;
  }

  /**
   * Adım 2: Admin merkeze teslim alır → WAREHOUSE_RECEIVED
   */
  async warehouseReceive(orderId: string, adminId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');
    if (order.shippingStatus !== ShippingStatus.DEALER_SHIPPED) {
      throw new BadRequestException(`Beklenen durum DEALER_SHIPPED, mevcut: ${order.shippingStatus}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus:     ShippingStatus.WAREHOUSE_RECEIVED,
        warehouseReceivedAt: new Date(),
      },
    });
    await this.logActivity(adminId, 'WAREHOUSE_RECEIVE', 'Order', orderId, {
      dealerTrackingCode: order.dealerTrackingCode,
    });
    this.logger.log(`🏭 Merkez teslim aldı — Sipariş: ${orderId}`);
    return updated;
  }

  /**
   * Adım 3: Admin denetimi geçirir → INSPECTION_PASSED
   */
  async adminPassInspection(orderId: string, adminId: string, notes?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');
    if (order.shippingStatus !== ShippingStatus.WAREHOUSE_RECEIVED) {
      throw new BadRequestException(`Beklenen durum WAREHOUSE_RECEIVED, mevcut: ${order.shippingStatus}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus:  ShippingStatus.INSPECTION_PASSED,
        inspectionNotes: notes ?? null,
        inspectionPassedAt: new Date(),
      },
    });
    await this.logActivity(adminId, 'INSPECTION_PASSED', 'Order', orderId, { notes });
    this.logger.log(`🔍 Denetim geçti — Sipariş: ${orderId}`);
    return updated;
  }

  /**
   * Adım 4: Admin müşteriye kargolar → ADMIN_SHIPPED
   */
  async adminShipToCustomer(orderId: string, adminId: string, trackingCode: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Sipariş bulunamadı.');
    if (order.shippingStatus !== ShippingStatus.INSPECTION_PASSED) {
      throw new BadRequestException(`Beklenen durum INSPECTION_PASSED, mevcut: ${order.shippingStatus}`);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus:    ShippingStatus.ADMIN_SHIPPED,
        adminTrackingCode: trackingCode,
        adminShippedAt:    new Date(),
      },
    });
    await this.logActivity(adminId, 'ADMIN_SHIP_TO_CUSTOMER', 'Order', orderId, { trackingCode });
    this.logger.log(`🚚 Admin müşteriye kargoladi — Sipariş: ${orderId}, Kargo: ${trackingCode}`);
    return updated;
  }

  /**
   * Adım 5: Müşteri teslim aldı → DELIVERED → escrow otomatik serbest bırakılır
   * Admin tarafından onaylanır.
   */
  async markDelivered(orderId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Sipariş bulunamadı.');
      if (order.shippingStatus !== ShippingStatus.ADMIN_SHIPPED) {
        throw new BadRequestException(`Beklenen durum ADMIN_SHIPPED, mevcut: ${order.shippingStatus}`);
      }
      if (order.paymentStatus !== PaymentStatus.ESCROW) {
        throw new BadRequestException('Ödeme zaten işlenmiş.');
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          shippingStatus: ShippingStatus.DELIVERED,
          deliveredAt:    new Date(),
          paymentStatus:  PaymentStatus.RELEASED, // Escrow otomatik serbest
        },
      });
      this.logger.log(`✅ Teslim onaylandi, escrow serbest — Sipariş: ${orderId}`);
      return updated;
    }).then(async (result) => {
      await this.logActivity(adminId, 'RELEASE_ESCROW', 'Order', orderId, {
        trigger: 'DELIVERED',
        amount: result.amount,
      });
      return result;
    });
  }

  // ── MEVCUT METODLAR ───────────────────────────────────────────────────────────

  /**
   * Admin — escrow'u manuel serbest bırakır (ödemeyi bayiye aktarır).
   * Transaction + state-guard ile çifte çağrı yarışını engeller.
   */
  async releaseEscrow(orderId: string, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Sipariş bulunamadı.');
      if (order.paymentStatus !== PaymentStatus.ESCROW) {
        throw new BadRequestException('Bu sipariş zaten işlenmiş.');
      }

      // Atomic guarded update: sadece hâlâ ESCROW'daysa güncelle
      const result = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: PaymentStatus.ESCROW },
        data: {
          paymentStatus:  PaymentStatus.RELEASED,
          shippingStatus: ShippingStatus.DELIVERED,
          deliveredAt:    new Date(),
        },
      });
      if (result.count === 0) {
        throw new BadRequestException('Sipariş durumu değişti, lütfen yenileyin.');
      }
      return tx.order.findUnique({ where: { id: orderId } });
    }).then(async (result) => {
      if (adminId) {
        await this.logActivity(adminId, 'RELEASE_ESCROW', 'Order', orderId, {
          trigger: 'MANUAL',
          amount: result?.amount,
        });
      }
      return result;
    });
  }

  /**
   * Admin — iade kararı verir.
   */
  async refundOrder(orderId: string, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Sipariş bulunamadı.');
      if (order.paymentStatus !== PaymentStatus.ESCROW) {
        throw new BadRequestException('Bu sipariş zaten işlenmiş.');
      }

      // Atomic guarded update
      const result = await tx.order.updateMany({
        where: { id: orderId, paymentStatus: PaymentStatus.ESCROW },
        data: { paymentStatus: PaymentStatus.REFUNDED },
      });
      if (result.count === 0) {
        throw new BadRequestException('Sipariş durumu değişti, lütfen yenileyin.');
      }

      // Restore stock — DealerStock veya eski Product sistemine göre
      if (order.dealerStockId) {
        await tx.dealerStock.update({
          where: { id: order.dealerStockId },
          data:  { stock: { increment: order.quantity } },
        });
      } else if (order.productId) {
        await tx.product.update({
          where: { id: order.productId },
          data:  { stock: { increment: order.quantity } },
        });
      }

      return tx.order.findUnique({ where: { id: orderId } });
    }).then(async (result) => {
      if (adminId) {
        await this.logActivity(adminId, 'REFUND_ORDER', 'Order', orderId, {
          amount: result?.amount,
        });
      }
      return result;
    });
  }

  /**
   * Admin — tüm siparişleri görür
   */
  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { brand: true, model: true, imagesUrl: true },
        },
      },
    });
  }
}
