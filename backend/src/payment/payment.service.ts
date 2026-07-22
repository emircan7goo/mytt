/**
 * PaymentService — PayTR İframe Entegrasyonu
 *
 * Akış:
 * 1. Müşteri checkout'ta "Öde" butonuna basar
 * 2. POST /payment/start-checkout → sipariş PENDING oluşur + PayTR token alınır
 * 3. Frontend iframe'de PayTR ödeme formunu gösterir
 * 4. Müşteri kartını girer, 3D Secure tamamlar
 * 5. PayTR POST /payment/paytr-callback çağırır
 * 6. Biz HMAC doğrularız → başarılıysa ESCROW, başarısızsa CANCELLED + stok iade
 *
 * Ortam değişkenleri (.env):
 *   PAYTR_MERCHANT_ID
 *   PAYTR_MERCHANT_KEY
 *   PAYTR_MERCHANT_SALT
 *   FRONTEND_URL  (ok/fail yönlendirme için)
 */
import {
  Injectable,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';

// ── Checkout başlatma DTO ─────────────────────────────────────────────────────
export interface StartCheckoutDto {
  productId:       string;   // DealerStock veya Product ID
  quantity:        number;
  shippingAddress: string;
  userEmail:       string;
  userName:        string;
  userIp:          string;
  productName:     string;   // iframe'de gösterilecek ürün adı
  amount:          number;   // TL cinsinden toplam tutar
}

// ── PayTR API yanıtı ──────────────────────────────────────────────────────────
interface PaytrTokenResponse {
  status: 'success' | 'failed';
  token?:  string;
  reason?: string;
}

// ── PayTR callback body ───────────────────────────────────────────────────────
export interface PaytrCallbackBody {
  merchant_oid:        string;
  status:              'success' | 'failed';
  total_amount:        string;
  hash:                string;
  failed_reason_code?: string;
  failed_reason_msg?:  string;
  test_mode?:          string;
  payment_type?:       string;
  currency?:           string;
  installment_count?:  string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // PayTR credentials — eksikse uyar ama çökme
  private readonly merchantId   = process.env.PAYTR_MERCHANT_ID   ?? '';
  private readonly merchantKey  = process.env.PAYTR_MERCHANT_KEY  ?? '';
  private readonly merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? '';
  private readonly testMode     = process.env.NODE_ENV !== 'production' ? '1' : '0';
  private readonly frontendUrl  = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  // MOCK_PAYMENT=true → PayTR iframe atlanır, sipariş doğrudan ESCROW olur
  private readonly mockPayment  = process.env.MOCK_PAYMENT === 'true' || !process.env.PAYTR_MERCHANT_ID;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail:   MailService,
  ) {
    if (this.mockPayment) {
      this.logger.warn(
        '⚠️  MOCK_PAYMENT modu aktif — Ödeme adımı atlanıyor, siparişler doğrudan ESCROW\'a geçiyor.',
      );
    }
  }

  // ── PayTR token al ─────────────────────────────────────────────────────────
  async getPaytrToken(
    orderId:     string,
    amount:      number,       // TL
    userEmail:   string,
    userIp:      string,
    userName:    string,
    productName: string,
    quantity:    number,
  ): Promise<string> {
    const amountKurus   = Math.round(amount * 100).toString();
    const currency      = 'TL';
    const noInstallment = '0';          // 0 = taksit seçenekleri göster
    const maxInstallment= '0';          // 0 = PayTR sınırı kullan
    const timeoutLimit  = '30';         // dakika

    // user_basket: base64(json([[ad, birim_fiyat, adet], ...]))
    const basketArr  = [[productName, (amount / quantity).toFixed(2), quantity]];
    const userBasket = Buffer.from(JSON.stringify(basketArr)).toString('base64');

    // HMAC-SHA256 hash
    const hashStr =
      this.merchantId +
      userIp +
      orderId +
      userEmail +
      amountKurus +
      userBasket +
      noInstallment +
      maxInstallment +
      currency +
      this.testMode +
      this.merchantSalt;

    const paytrToken = crypto
      .createHmac('sha256', this.merchantKey)
      .update(hashStr)
      .digest('base64');

    const params = new URLSearchParams({
      merchant_id:      this.merchantId,
      user_ip:          userIp,
      merchant_oid:     orderId,
      email:            userEmail,
      payment_amount:   amountKurus,
      paytr_token:      paytrToken,
      user_basket:      userBasket,
      debug_on:         '0',
      no_installment:   noInstallment,
      max_installment:  maxInstallment,
      user_name:        userName,
      user_address:     '',
      user_phone:       '',
      merchant_ok_url:  `${this.frontendUrl}/payment/basarili`,
      merchant_fail_url:`${this.frontendUrl}/payment/basarisiz`,
      timeout_limit:    timeoutLimit,
      currency,
      test_mode:        this.testMode,
      non_3d:           '0',            // 3D Secure zorunlu
    });

    this.logger.log(`PayTR token isteği — Sipariş: ${orderId}, Tutar: ${amount} TL`);

    const res = await fetch('https://www.paytr.com/odeme/api/v1', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });

    if (!res.ok) {
      throw new InternalServerErrorException('PayTR API\'ye ulaşılamadı');
    }

    const json = (await res.json()) as PaytrTokenResponse;

    if (json.status !== 'success' || !json.token) {
      this.logger.error('PayTR token hatası:', json);
      throw new BadRequestException(
        `Ödeme başlatılamadı: ${json.reason ?? 'Bilinmeyen PayTR hatası'}`,
      );
    }

    return json.token;
  }

  // ── Checkout başlat: sipariş oluştur + PayTR token al ─────────────────────
  async startCheckout(buyerId: string, dto: StartCheckoutDto) {
    // Ürünü ve stoku kontrol et (transaction içinde)
    // Yeni sistem: DealerStock — Eski sistem: Product (backward compat.)
    const result = await this.prisma.$transaction(async (tx) => {

      // ── 1. Önce DealerStock'ta ara (yeni katalog sistemi) ─────────────────
      const dealerStock = await tx.dealerStock.findUnique({
        where:   { id: dto.productId },
        include: {
          store: { select: { ownerId: true, name: true, owner: { select: { commissionRate: true } } } },
          globalProduct: true,
        },
      });

      if (dealerStock) {
        // DealerStock ürün akışı
        if (dealerStock.stock < dto.quantity)         throw new BadRequestException('Yeterli stok yok');
        if (dealerStock.store.ownerId === buyerId)    throw new BadRequestException('Kendi ürününüzü satın alamazsınız');

        const totalAmount = Number(dealerStock.price) * dto.quantity;
        // Bayinin kendi komisyon oranı — hiç atanmamışsa platform varsayılanı %5'e düş.
        const commissionRate = Number(dealerStock.store.owner.commissionRate) || 0.05;

        const order = await tx.order.create({
          data: {
            buyerId,
            sellerId:        dealerStock.store.ownerId,
            dealerStockId:   dealerStock.id,     // yeni ilişki
            quantity:        dto.quantity,
            amount:          totalAmount,
            commissionRate,
            paymentStatus:   PaymentStatus.PENDING,
            shippingAddress: dto.shippingAddress,
          },
        });

        await tx.dealerStock.update({
          where: { id: dealerStock.id },
          data:  { stock: { decrement: dto.quantity } },
        });

        return { order, totalAmount, storeName: dealerStock.store.name };
      }

      // ── 2. DealerStock'ta yoksa eski Product tablosunda ara ──────────────
      const product = await tx.product.findUnique({
        where:   { id: dto.productId },
        include: { store: { select: { ownerId: true, name: true, owner: { select: { commissionRate: true } } } } },
      });

      if (!product)                          throw new BadRequestException('Ürün bulunamadı');
      if (product.stock < dto.quantity)      throw new BadRequestException('Yeterli stok yok');
      if (product.store.ownerId === buyerId) throw new BadRequestException('Kendi ürününüzü satın alamazsınız');

      const unitPrice = product.isOnCampaign && product.discountedPrice != null
        ? Number(product.discountedPrice)
        : Number(product.price);

      const totalAmount = unitPrice * dto.quantity;
      const commissionRate = Number(product.store.owner.commissionRate) || 0.05;

      // Sipariş PENDING durumunda oluştur (stok düş ama para alınmadı)
      const order = await tx.order.create({
        data: {
          buyerId,
          sellerId:        product.store.ownerId,
          productId:       dto.productId,
          quantity:        dto.quantity,
          amount:          totalAmount,
          commissionRate,
          paymentStatus:   PaymentStatus.PENDING,
          shippingAddress: dto.shippingAddress,
        },
      });

      // Stoku şimdi düşür — ödeme iptal olursa geri iade edilir
      await tx.product.update({
        where: { id: dto.productId },
        data:  { stock: { decrement: dto.quantity } },
      });

      return { order, totalAmount, storeName: product.store.name };
    });

    // Mock mod — PayTR atlanır, sipariş doğrudan ESCROW'a alınır
    if (this.mockPayment) {
      const mockOrder = await this.prisma.order.update({
        where: { id: result.order.id },
        data:  { paymentStatus: PaymentStatus.ESCROW },
        include: {
          buyer:  { select: { email: true, name: true } },
          seller: { select: { email: true, name: true } },
        },
      });

      const productName = dto.productName || 'Ürün';

      void this.mail.sendOrderConfirmation({
        buyerEmail:  mockOrder.buyer.email,
        buyerName:   mockOrder.buyer.name ?? mockOrder.buyer.email,
        orderId:     mockOrder.id,
        productName,
        amount:      result.totalAmount,
      });

      void this.mail.sendNewOrderNotification({
        dealerEmail: mockOrder.seller.email,
        dealerName:  mockOrder.seller.name ?? mockOrder.seller.email,
        orderId:     mockOrder.id,
        productName,
        quantity:    dto.quantity,
        amount:      result.totalAmount,
      });

      this.logger.log(`🧪 Mock ödeme — Sipariş ESCROW'a alındı: ${mockOrder.id}`);
      return {
        orderId:  mockOrder.id,
        amount:   result.totalAmount,
        testMode: true,
      };
    }

    // PayTR'dan token al
    const iframeToken = await this.getPaytrToken(
      result.order.id,
      result.totalAmount,
      dto.userEmail,
      dto.userIp,
      dto.userName,
      dto.productName,
      dto.quantity,
    );

    // Token'ı order'a kaydet (debug/izleme için)
    await this.prisma.order.update({
      where: { id: result.order.id },
      data:  { paymentToken: iframeToken },
    });

    return {
      orderId:     result.order.id,
      iframeToken,
      amount:      result.totalAmount,
      testMode:    false,
    };
  }

  // ── PayTR callback HMAC doğrula ────────────────────────────────────────────
  private verifyPaytrHash(body: PaytrCallbackBody): boolean {
    const hashStr =
      body.merchant_oid +
      this.merchantSalt +
      body.status +
      body.total_amount;

    const expected = crypto
      .createHmac('sha256', this.merchantKey)
      .update(hashStr)
      .digest('base64');

    return expected === body.hash;
  }

  // ── PayTR callback işle ────────────────────────────────────────────────────
  async handlePaytrCallback(body: PaytrCallbackBody): Promise<'OK' | 'PAYTR_INVALID'> {
    // Hash doğrulama
    // Mock modda callback gelmez; production'da merchantKey zorunlu
    if (!this.merchantKey || !this.verifyPaytrHash(body)) {
      this.logger.warn(`PayTR HMAC doğrulaması başarısız — Sipariş: ${body.merchant_oid}`);
      return 'PAYTR_INVALID';
    }

    const orderId = body.merchant_oid;

    if (body.status === 'success') {
      // Ödeme başarılı → ESCROW'a al, token temizle
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.ESCROW,
          paymentToken:  null,
        },
        include: {
          buyer:   { select: { email: true, name: true } },
          seller:  { select: { email: true, name: true } },
          product: { select: { brand: true, model: true } },
        },
      });
      this.logger.log(`✅ Ödeme başarılı, escrow'a alındı — Sipariş: ${orderId}`);

      // Ürün adını belirle (Product veya DealerStock)
      const productName = updatedOrder.product
        ? `${updatedOrder.product.brand ?? ''} ${updatedOrder.product.model ?? ''}`.trim() || 'Ürün'
        : 'Ürün';

      // Alıcıya sipariş onay emaili
      void this.mail.sendOrderConfirmation({
        buyerEmail:  updatedOrder.buyer.email,
        buyerName:   updatedOrder.buyer.name ?? updatedOrder.buyer.email,
        orderId:     updatedOrder.id,
        productName,
        amount:      Number(updatedOrder.amount),
      });

      // Bayiye yeni sipariş bildirimi
      void this.mail.sendNewOrderNotification({
        dealerEmail: updatedOrder.seller.email,
        dealerName:  updatedOrder.seller.name ?? updatedOrder.seller.email,
        orderId:     updatedOrder.id,
        productName,
        quantity:    updatedOrder.quantity,
        amount:      Number(updatedOrder.amount),
      });
    } else {
      // Ödeme başarısız → iptal et, stok iade et
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order && order.paymentStatus === PaymentStatus.PENDING) {
        // Stok iadesi — DealerStock veya eski Product sistemine göre
        await this.prisma.order.update({
          where: { id: orderId },
          data:  { paymentStatus: PaymentStatus.CANCELLED, paymentToken: null },
        });

        if (order.dealerStockId) {
          await this.prisma.dealerStock.update({
            where: { id: order.dealerStockId },
            data:  { stock: { increment: order.quantity } },
          });
        } else if (order.productId) {
          await this.prisma.product.update({
            where: { id: order.productId },
            data:  { stock: { increment: order.quantity } },
          });
        }
        this.logger.warn(
          `❌ Ödeme başarısız (Kod: ${body.failed_reason_code ?? '-'}, ` +
          `Mesaj: ${body.failed_reason_msg ?? '-'}) — Sipariş: ${orderId}`,
        );
      }
    }

    // PayTR OK yanıtı bekler — aksi hâlde tekrar tekrar gönderir
    return 'OK';
  }

  // ── İade isteği (admin) ────────────────────────────────────────────────────
  async requestRefund(orderId: string): Promise<{ success: boolean; message: string }> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Sipariş bulunamadı');
    if (order.paymentStatus !== PaymentStatus.ESCROW) {
      throw new BadRequestException('Yalnızca escrow\'daki siparişler iade edilebilir');
    }

    // TODO: PayTR iade API entegrasyonu
    // POST https://www.paytr.com/odeme/iade
    // Fields: merchant_id, merchant_oid, return_amount, paytr_token
    // paytr_token = base64(sha256(merchant_id + merchant_oid + return_amount + merchant_salt, merchant_key))
    //
    // Şu an OrderService.refundOrder() üzerinden yapılıyor (stok iade + status güncelle)

    this.logger.log(`İade isteği (manuel): Sipariş ${orderId}`);
    return { success: true, message: 'İade işlemi başlatıldı' };
  }
}
