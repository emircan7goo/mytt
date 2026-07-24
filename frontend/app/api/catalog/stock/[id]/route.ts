/**
 * PATCH /api/catalog/stock/[id] — Bayi kendi stok kaydını günceller.
 * DELETE /api/catalog/stock/[id] — Bayi kendi stok kaydını siler.
 * (backend/src/catalog/catalog.service.ts → updateDealerStock/removeDealerStock'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const dto = await req.json().catch(() => null);
  if (!dto) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  const store = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (!store) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const stock = await prisma.dealerStock.findUnique({ where: { id } });
  if (!stock) return NextResponse.json({ message: 'Stok kaydı bulunamadı.' }, { status: 404 });
  if (stock.storeId !== store.id) return NextResponse.json({ message: 'Bu stok kaydı size ait değil.' }, { status: 403 });

  const updated = await prisma.dealerStock.update({
    where: { id },
    data: {
      ...(dto.grade !== undefined && { grade: dto.grade }),
      ...(dto.batteryHealth !== undefined && { batteryHealth: dto.batteryHealth }),
      ...(dto.hasBox !== undefined && { hasBox: dto.hasBox }),
      ...(dto.hasInvoice !== undefined && { hasInvoice: dto.hasInvoice }),
      ...(dto.hasAccessories !== undefined && { hasAccessories: dto.hasAccessories }),
      ...(dto.warrantyMonths !== undefined && { warrantyMonths: dto.warrantyMonths }),
      ...(dto.price !== undefined && { price: new Prisma.Decimal(dto.price) }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
      ...(dto.dealerImages !== undefined && { dealerImages: dto.dealerImages }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const store = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (!store) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const stock = await prisma.dealerStock.findUnique({ where: { id } });
  if (!stock) return NextResponse.json({ message: 'Stok bulunamadı.' }, { status: 404 });
  if (stock.storeId !== store.id) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  await prisma.dealerStock.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
