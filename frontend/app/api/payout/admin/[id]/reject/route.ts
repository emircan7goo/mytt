/**
 * PATCH /api/payout/admin/[id]/reject — [Admin] Talebi reddet (gerekçe zorunlu).
 * (backend/src/payout/payout.service.ts → adminReject'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const note: string | undefined = body?.note?.trim();
  if (!note) return NextResponse.json({ message: 'Reddetme gerekçesi zorunludur.' }, { status: 400 });

  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ message: 'Hakediş talebi bulunamadı.' }, { status: 404 });
  if (payout.status === 'PAID') {
    return NextResponse.json({ message: 'Ödenmiş bir talep reddedilemez.' }, { status: 400 });
  }

  const updated = await prisma.payout.update({
    where: { id },
    data: { status: 'REJECTED', processedAt: new Date(), processedBy: gate.user.id, adminNote: note },
  });

  return NextResponse.json(updated);
}
