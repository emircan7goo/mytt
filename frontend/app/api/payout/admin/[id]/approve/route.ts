/**
 * PATCH /api/payout/admin/[id]/approve — [Admin] Talebi onayla (havale bekleniyor).
 * (backend/src/payout/payout.service.ts → adminApprove'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const payout = await prisma.payout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ message: 'Hakediş talebi bulunamadı.' }, { status: 404 });
  if (payout.status !== 'PENDING') {
    return NextResponse.json({ message: 'Sadece bekleyen talepler onaylanabilir.' }, { status: 400 });
  }

  const updated = await prisma.payout.update({ where: { id }, data: { status: 'APPROVED', processedBy: gate.user.id } });
  return NextResponse.json(updated);
}
