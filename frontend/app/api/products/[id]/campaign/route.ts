/**
 * PATCH /api/products/[id]/campaign — [Bayi] Kendi ürününe kampanya ekle/düzenle.
 * (backend/src/product/product.service.ts → updateCampaign'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const dto = await req.json().catch(() => null);
  if (!dto) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id }, include: { store: { select: { ownerId: true } } } });
  if (!product) return NextResponse.json({ message: 'Ürün bulunamadı.' }, { status: 404 });
  if (product.store.ownerId !== gate.user.id) {
    return NextResponse.json({ message: 'Sadece kendi ürünlerinizi düzenleyebilirsiniz.' }, { status: 403 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      isOnCampaign: dto.isOnCampaign,
      discountedPrice: dto.discountedPrice ?? null,
      campaignTag: dto.campaignTag ?? null,
      campaignEndDate: dto.campaignEndDate ? new Date(dto.campaignEndDate) : null,
    },
  });

  return NextResponse.json(updated);
}
