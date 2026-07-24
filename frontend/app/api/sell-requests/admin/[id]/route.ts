/**
 * GET   /api/sell-requests/admin/[id] — [Admin] Tekil talep tam detay.
 * PATCH /api/sell-requests/admin/[id] — [Admin] Durum/fiyat/atama güncelle.
 * (backend/src/sell-requests/sell-requests.service.ts → findOneAdmin/updateAdmin'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const request = await prisma.sellRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      bids: { orderBy: { amount: 'desc' }, include: { dealer: { select: { id: true, email: true, name: true, companyName: true } } } },
      winningDealer: { select: { id: true, email: true, name: true, companyName: true } },
    },
  });
  if (!request) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

  return NextResponse.json(request);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const dto = await req.json().catch(() => null);
  if (!dto) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  const existing = await prisma.sellRequest.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

  const updated = await prisma.sellRequest.update({
    where: { id },
    data: {
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.finalPrice !== undefined && { finalPrice: dto.finalPrice }),
      ...(dto.winningDealerId !== undefined && { winningDealerId: dto.winningDealerId }),
      ...(dto.shippingCode !== undefined && { shippingCode: dto.shippingCode }),
      ...(dto.adminNote !== undefined && { adminNote: dto.adminNote }),
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
      bids: { include: { dealer: { select: { id: true, email: true, name: true } } } },
      winningDealer: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json(updated);
}
