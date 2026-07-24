/**
 * POST /api/catalog/stock — Bayi yeni stok ekler (katalogdan bir modele bağlı).
 * En az 3 fotoğraf zorunlu — cihazın gerçekten elinde olduğunu kanıtlamak için.
 * (backend/src/catalog/catalog.service.ts → addDealerStock'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { validateImei } from '@/lib/btk';

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const dto = await req.json().catch(() => null);
  if (!dto) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  if (typeof dto.globalProductId !== 'string' || !dto.globalProductId) {
    return NextResponse.json({ message: 'globalProductId zorunludur.' }, { status: 400 });
  }
  if (typeof dto.grade !== 'string' || !dto.grade) {
    return NextResponse.json({ message: 'grade zorunludur.' }, { status: 400 });
  }
  if (typeof dto.price !== 'number' || dto.price <= 0) {
    return NextResponse.json({ message: 'price geçerli değil.' }, { status: 400 });
  }
  if (!Array.isArray(dto.dealerImages) || dto.dealerImages.length < 3) {
    return NextResponse.json(
      { message: 'Cihazın gerçekten elinizde olduğunu kanıtlamak için en az 3 fotoğraf yüklenmesi zorunludur.' },
      { status: 400 },
    );
  }

  let store = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (!store) {
    const app = await prisma.dealerApplication.findUnique({ where: { userId: gate.user.id } });
    store = await prisma.store.create({ data: { ownerId: gate.user.id, name: app?.companyName ?? 'Bayi Mağazası' } });
  }

  const globalProduct = await prisma.globalProduct.findUnique({ where: { id: dto.globalProductId } });
  if (!globalProduct) return NextResponse.json({ message: 'Katalog ürünü bulunamadı.' }, { status: 404 });

  if (dto.imei) {
    const imeiError = validateImei(dto.imei);
    if (imeiError) return NextResponse.json({ message: imeiError }, { status: 400 });
  }

  const stock = await prisma.dealerStock.create({
    data: {
      globalProductId: dto.globalProductId,
      storeId: store.id,
      grade: dto.grade,
      batteryHealth: dto.batteryHealth,
      hasBox: dto.hasBox ?? false,
      hasInvoice: dto.hasInvoice ?? false,
      hasAccessories: dto.hasAccessories ?? false,
      warrantyMonths: dto.warrantyMonths,
      imei: dto.imei,
      dealerImages: dto.dealerImages,
      price: new Prisma.Decimal(dto.price),
      stock: dto.stock ?? 1,
      notes: dto.notes,
    },
  });

  return NextResponse.json(stock, { status: 201 });
}
