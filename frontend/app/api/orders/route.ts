/**
 * POST /api/orders — Müşteri sipariş oluşturur (eski/legacy Product akışı).
 * GET  /api/orders — Admin: tüm siparişleri listeler.
 * (backend/src/order/order.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const productId = body?.productId;
  const quantity = Number(body?.quantity);
  const shippingAddress: string | undefined = body?.shippingAddress;
  const notes: string | undefined = body?.notes;

  if (typeof productId !== 'string' || !productId) {
    return NextResponse.json({ message: 'productId zorunludur.' }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return NextResponse.json({ message: 'quantity en az 1 olmalıdır.' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          store: { select: { ownerId: true, name: true, owner: { select: { commissionRate: true } } } },
        },
      });

      if (!product) throw new Error('NOT_FOUND');
      if (product.stock < quantity) throw new Error(`INSUFFICIENT_STOCK:${product.stock}`);
      if (product.store.ownerId === user.id) throw new Error('SELF_PURCHASE');

      const unitPrice = product.isOnCampaign && product.discountedPrice != null
        ? product.discountedPrice
        : product.price;
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
          shippingStatus: 'WAITING_DEALER_SHIPMENT',
          shippingAddress,
          notes,
        },
      });

      await tx.product.update({ where: { id: productId }, data: { stock: { decrement: quantity } } });

      return { ...order, storeName: product.store.name };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err.message === 'NOT_FOUND') return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
    if (err.message === 'SELF_PURCHASE') return NextResponse.json({ message: 'Kendi ürününüzü satın alamazsınız.' }, { status: 400 });
    if (err.message?.startsWith('INSUFFICIENT_STOCK')) {
      const stock = err.message.split(':')[1];
      return NextResponse.json({ message: `Yeterli stok yok. Mevcut stok: ${stock}` }, { status: 400 });
    }
    throw err;
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  if (user.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { brand: true, model: true, imagesUrl: true } } },
  });

  return NextResponse.json(orders);
}
