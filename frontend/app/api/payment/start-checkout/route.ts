/**
 * POST /api/payment/start-checkout
 * Giriş yapmış kullanıcı → sipariş oluşturur + (varsa) PayTR iframe token alır.
 * PAYTR_MERCHANT_ID tanımlı değilse veya MOCK_PAYMENT=true ise ödeme adımı
 * atlanır, sipariş doğrudan ESCROW'a geçer (yerel geliştirme / henüz PayTR
 * sözleşmesi yokken).
 * (backend/src/payment/payment.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getAuthUser, displayName } from '@/lib/auth-server';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/mail';

const merchantId = process.env.PAYTR_MERCHANT_ID ?? '';
const merchantKey = process.env.PAYTR_MERCHANT_KEY ?? '';
const merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? '';
const testMode = process.env.NODE_ENV !== 'production' ? '1' : '0';
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
const mockPayment = process.env.MOCK_PAYMENT === 'true' || !process.env.PAYTR_MERCHANT_ID;

interface PaytrTokenResponse {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
}

async function getPaytrToken(
  orderId: string, amount: number, userEmail: string, userIp: string,
  userName: string, productName: string, quantity: number,
): Promise<string> {
  const amountKurus = Math.round(amount * 100).toString();
  const currency = 'TL';
  const noInstallment = '0';
  const maxInstallment = '0';
  const timeoutLimit = '30';

  const basketArr = [[productName, (amount / quantity).toFixed(2), quantity]];
  const userBasket = Buffer.from(JSON.stringify(basketArr)).toString('base64');

  const hashStr =
    merchantId + userIp + orderId + userEmail + amountKurus + userBasket +
    noInstallment + maxInstallment + currency + testMode + merchantSalt;

  const paytrToken = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64');

  const params = new URLSearchParams({
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: orderId,
    email: userEmail,
    payment_amount: amountKurus,
    paytr_token: paytrToken,
    user_basket: userBasket,
    debug_on: '0',
    no_installment: noInstallment,
    max_installment: maxInstallment,
    user_name: userName,
    user_address: '',
    user_phone: '',
    merchant_ok_url: `${frontendUrl}/payment/basarili`,
    merchant_fail_url: `${frontendUrl}/payment/basarisiz`,
    timeout_limit: timeoutLimit,
    currency,
    test_mode: testMode,
    non_3d: '0',
  });

  const res = await fetch('https://www.paytr.com/odeme/api/v1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error("PayTR API'ye ulaşılamadı");

  const json = (await res.json()) as PaytrTokenResponse;
  if (json.status !== 'success' || !json.token) {
    throw new Error(`Ödeme başlatılamadı: ${json.reason ?? 'Bilinmeyen PayTR hatası'}`);
  }
  return json.token;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user?.email) return NextResponse.json({ message: 'Kullanıcı bilgisi eksik' }, { status: 400 });

  const body = await req.json().catch(() => null);
  const productId = body?.productId;
  const quantity = Number(body?.quantity);
  const shippingAddress = body?.shippingAddress;
  const productName = body?.productName;
  const amount = Number(body?.amount);

  if (typeof productId !== 'string' || !productId) {
    return NextResponse.json({ message: 'productId zorunludur.' }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ message: 'quantity en az 1 olmalıdır.' }, { status: 400 });
  }
  if (typeof shippingAddress !== 'string' || !shippingAddress) {
    return NextResponse.json({ message: 'shippingAddress zorunludur.' }, { status: 400 });
  }
  if (typeof productName !== 'string' || !productName) {
    return NextResponse.json({ message: 'productName zorunludur.' }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < 0.01) {
    return NextResponse.json({ message: 'amount geçerli değil.' }, { status: 400 });
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  const userIp = forwardedFor?.split(',')[0]?.trim() ?? '127.0.0.1';
  const userName = displayName(user);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const dealerStock = await tx.dealerStock.findUnique({
        where: { id: productId },
        include: {
          store: { select: { ownerId: true, name: true, owner: { select: { commissionRate: true } } } },
          globalProduct: true,
        },
      });

      if (dealerStock) {
        if (dealerStock.stock < quantity) throw new Error('INSUFFICIENT_STOCK');
        if (dealerStock.store.ownerId === user.id) throw new Error('SELF_PURCHASE');

        const totalAmount = Number(dealerStock.price) * quantity;
        const commissionRate = Number(dealerStock.store.owner.commissionRate) || 0.05;

        const order = await tx.order.create({
          data: {
            buyerId: user.id,
            sellerId: dealerStock.store.ownerId,
            dealerStockId: dealerStock.id,
            quantity,
            amount: totalAmount,
            commissionRate,
            paymentStatus: 'PENDING',
            shippingAddress,
          },
        });

        await tx.dealerStock.update({ where: { id: dealerStock.id }, data: { stock: { decrement: quantity } } });

        return { order, totalAmount, storeName: dealerStock.store.name };
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { store: { select: { ownerId: true, name: true, owner: { select: { commissionRate: true } } } } },
      });

      if (!product) throw new Error('NOT_FOUND');
      if (product.stock < quantity) throw new Error('INSUFFICIENT_STOCK');
      if (product.store.ownerId === user.id) throw new Error('SELF_PURCHASE');

      const unitPrice = product.isOnCampaign && product.discountedPrice != null
        ? Number(product.discountedPrice)
        : Number(product.price);
      const totalAmount = unitPrice * quantity;
      const commissionRate = Number(product.store.owner.commissionRate) || 0.05;

      const order = await tx.order.create({
        data: {
          buyerId: user.id,
          sellerId: product.store.ownerId,
          productId,
          quantity,
          amount: totalAmount,
          commissionRate,
          paymentStatus: 'PENDING',
          shippingAddress,
        },
      });

      await tx.product.update({ where: { id: productId }, data: { stock: { decrement: quantity } } });

      return { order, totalAmount, storeName: product.store.name };
    });

    if (mockPayment) {
      const mockOrder = await prisma.order.update({
        where: { id: result.order.id },
        data: { paymentStatus: 'ESCROW' },
        include: {
          buyer: { select: { email: true, name: true } },
          seller: { select: { email: true, name: true } },
        },
      });

      waitUntil(sendOrderConfirmation({
        buyerEmail: mockOrder.buyer.email,
        buyerName: mockOrder.buyer.name ?? mockOrder.buyer.email,
        orderId: mockOrder.id,
        productName,
        amount: result.totalAmount,
      }));

      waitUntil(sendNewOrderNotification({
        dealerEmail: mockOrder.seller.email,
        dealerName: mockOrder.seller.name ?? mockOrder.seller.email,
        orderId: mockOrder.id,
        productName,
        quantity,
        amount: result.totalAmount,
      }));

      return NextResponse.json({ orderId: mockOrder.id, amount: result.totalAmount, testMode: true });
    }

    const iframeToken = await getPaytrToken(
      result.order.id, result.totalAmount, user.email, userIp, userName, productName, quantity,
    );

    await prisma.order.update({ where: { id: result.order.id }, data: { paymentToken: iframeToken } });

    return NextResponse.json({ orderId: result.order.id, iframeToken, amount: result.totalAmount, testMode: false });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return NextResponse.json({ message: 'Ürün bulunamadı' }, { status: 404 });
    if (err.message === 'SELF_PURCHASE') return NextResponse.json({ message: 'Kendi ürününüzü satın alamazsınız' }, { status: 400 });
    if (err.message === 'INSUFFICIENT_STOCK') return NextResponse.json({ message: 'Yeterli stok yok' }, { status: 400 });
    return NextResponse.json({ message: err.message ?? 'Ödeme başlatılamadı' }, { status: 500 });
  }
}
