/**
 * DELETE /api/dealer-market/[id] — [Satıcı Bayi] İlanı iptal et.
 * (backend/src/dealer-market/dealer-market.service.ts → cancelListing'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const item = await prisma.dealerMarketItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  if (item.sellerId !== gate.user.id) return NextResponse.json({ message: 'Bu ilan size ait değil.' }, { status: 403 });
  if (item.status === 'SOLD') return NextResponse.json({ message: 'Satılmış ilan iptal edilemez.' }, { status: 400 });

  const updated = await prisma.dealerMarketItem.update({ where: { id }, data: { status: 'CANCELLED' } });
  return NextResponse.json(updated);
}
