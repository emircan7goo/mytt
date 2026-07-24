/**
 * POST /api/payment/paytr-callback — PayTR bu endpoint'i çağırır (public, auth yok).
 * HMAC doğrulanır, sipariş durumu güncellenir. PayTR "OK" düz metin yanıtı
 * bekler — JSON DÖNMEYİN, aksi halde callback'i tekrar tekrar gönderir.
 * (backend/src/payment/payment.service.ts → handlePaytrCallback'ten taşındı)
 */
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/mail';

const merchantKey = process.env.PAYTR_MERCHANT_KEY ?? '';
const merchantSalt = process.env.PAYTR_MERCHANT_SALT ?? '';

function verifyPaytrHash(body: Record<string, string>): boolean {
  const hashStr = body.merchant_oid + merchantSalt + body.status + body.total_amount;
  const expected = crypto.createHmac('sha256', merchantKey).update(hashStr).digest('base64');
  return expected === body.hash;
}

function ok() {
  return new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const body: Record<string, string> = {};
  form.forEach((value, key) => { body[key] = String(value); });

  if (!merchantKey || !verifyPaytrHash(body)) {
    console.warn(`PayTR HMAC doğrulaması başarısız — Sipariş: ${body.merchant_oid}`);
    return ok(); // PayTR'a her durumda OK dön — geçersiz istekte sipariş güncellenmez
  }

  const orderId = body.merchant_oid;

  if (body.status === 'success') {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'ESCROW', paymentToken: null },
      include: {
        buyer: { select: { email: true, name: true } },
        seller: { select: { email: true, name: true } },
        product: { select: { brand: true, model: true } },
      },
    });

    const productName = updatedOrder.product
      ? `${updatedOrder.product.brand ?? ''} ${updatedOrder.product.model ?? ''}`.trim() || 'Ürün'
      : 'Ürün';

    void sendOrderConfirmation({
      buyerEmail: updatedOrder.buyer.email,
      buyerName: updatedOrder.buyer.name ?? updatedOrder.buyer.email,
      orderId: updatedOrder.id,
      productName,
      amount: Number(updatedOrder.amount),
    });

    void sendNewOrderNotification({
      dealerEmail: updatedOrder.seller.email,
      dealerName: updatedOrder.seller.name ?? updatedOrder.seller.email,
      orderId: updatedOrder.id,
      productName,
      quantity: updatedOrder.quantity,
      amount: Number(updatedOrder.amount),
    });
  } else {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (order && order.paymentStatus === 'PENDING') {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'CANCELLED', paymentToken: null },
      });

      if (order.dealerStockId) {
        await prisma.dealerStock.update({ where: { id: order.dealerStockId }, data: { stock: { increment: order.quantity } } });
      } else if (order.productId) {
        await prisma.product.update({ where: { id: order.productId }, data: { stock: { increment: order.quantity } } });
      }
      console.warn(`❌ Ödeme başarısız (${body.failed_reason_code ?? '-'}: ${body.failed_reason_msg ?? '-'}) — Sipariş: ${orderId}`);
    }
  }

  return ok();
}
