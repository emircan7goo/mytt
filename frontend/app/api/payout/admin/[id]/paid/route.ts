/**
 * PATCH /api/payout/admin/[id]/paid — [Admin] Havale yapıldı, ödendi işaretle.
 * (backend/src/payout/payout.service.ts → adminMarkPaid'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const note: string | undefined = body?.note;

  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ message: 'Hakediş talebi bulunamadı.' }, { status: 404 });
  if (payout.status !== 'APPROVED' && payout.status !== 'PENDING') {
    return NextResponse.json({ message: 'Bu talep zaten sonuçlanmış.' }, { status: 400 });
  }

  const updated = await prisma.payout.update({
    where: { id },
    data: { status: 'PAID', processedAt: new Date(), processedBy: gate.user.id, adminNote: note ?? payout.adminNote },
  });

  return NextResponse.json(updated);
}
