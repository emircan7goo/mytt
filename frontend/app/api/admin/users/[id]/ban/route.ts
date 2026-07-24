/**
 * PATCH /api/admin/users/[id]/ban — Kullanıcıyı banla / aktif et (toggle).
 * (backend/src/admin/admin.service.ts → toggleUserBan'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 404 });

  const newStatus = !user.isActive;
  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: newStatus },
    select: { id: true, email: true, name: true, isActive: true, role: true, b2bStatus: true },
  });

  await logActivity(gate.user.id, newStatus ? 'UNBAN_USER' : 'BAN_USER', 'User', id, { email: user.email });

  return NextResponse.json(updated);
}
