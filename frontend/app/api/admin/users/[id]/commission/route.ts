/**
 * PATCH /api/admin/users/[id]/commission — Bayi komisyon oranını güncelle (% olarak gönderilir).
 * (backend/src/admin/admin.service.ts → updateUserCommission'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const commissionRate = Number(body?.commissionRate);
  if (!Number.isFinite(commissionRate)) {
    return NextResponse.json({ message: 'commissionRate geçerli değil.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id },
    data: { commissionRate: commissionRate / 100 },
    select: { id: true, email: true, name: true, commissionRate: true, isActive: true, b2bStatus: true },
  });

  await logActivity(gate.user.id, 'UPDATE_COMMISSION', 'User', id, {
    oldRate: user.commissionRate, newRate: commissionRate / 100,
  });

  return NextResponse.json(updated);
}
