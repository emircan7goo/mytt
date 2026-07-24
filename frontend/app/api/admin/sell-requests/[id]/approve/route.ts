/**
 * PATCH /api/admin/sell-requests/[id]/approve — Müşteri satış talebini onayla (bayilere açılır).
 * (backend/src/admin/admin.service.ts → approveSellRequest'ten taşındı)
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
  const adminNote: string | undefined = body?.adminNote;

  const reqRow = await prisma.sellRequest.findUnique({ where: { id } });
  if (!reqRow) return NextResponse.json({ message: 'Satış talebi bulunamadı' }, { status: 404 });

  const updated = await prisma.sellRequest.update({
    where: { id },
    data: { adminApproved: true, approvedAt: new Date(), adminNote: adminNote ?? undefined },
  });

  await logActivity(gate.user.id, 'APPROVE_SELL_REQUEST', 'SellRequest', id, { adminNote });

  return NextResponse.json(updated);
}
