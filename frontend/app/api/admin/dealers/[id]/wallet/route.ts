/**
 * PATCH /api/admin/dealers/[id]/wallet — [Admin] Bayi bakiyesini set veya artır.
 * (backend/src/admin/admin.service.ts → updateDealerWallet'tan taşındı)
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
  const amount = Number(body?.amount);
  const mode: 'set' | 'add' = body?.mode === 'add' ? 'add' : 'set';
  if (!Number.isFinite(amount)) {
    return NextResponse.json({ message: 'amount geçerli değil.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ message: 'Bayi bulunamadı.' }, { status: 404 });

  const oldBalance = Number(user.walletBalance ?? 0);
  const newBalance = mode === 'add' ? oldBalance + amount : amount;

  const updated = await prisma.user.update({
    where: { id },
    data: { walletBalance: newBalance },
    select: { id: true, name: true, email: true, companyName: true, walletBalance: true },
  });

  await logActivity(gate.user.id, 'UPDATE_DEALER_WALLET', 'User', id, { oldBalance, newBalance, mode, amount });

  return NextResponse.json(updated);
}
