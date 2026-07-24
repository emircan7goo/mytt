/**
 * PATCH /api/admin/dealer-stock/[id]/approve — Bayi stok girişini onayla (marketplace'de görünür).
 * (backend/src/admin/admin.service.ts → approveDealerStock'tan taşındı)
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

  const stock = await prisma.dealerStock.findUnique({ where: { id } });
  if (!stock) return NextResponse.json({ message: 'Stok girişi bulunamadı' }, { status: 404 });

  const updated = await prisma.dealerStock.update({
    where: { id },
    data: { adminApproved: true, approvedAt: new Date(), adminNote: adminNote ?? undefined },
  });

  await logActivity(gate.user.id, 'APPROVE_DEALER_STOCK', 'DealerStock', id, { adminNote });

  return NextResponse.json(updated);
}
