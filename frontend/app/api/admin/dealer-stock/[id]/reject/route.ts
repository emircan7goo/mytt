/**
 * PATCH /api/admin/dealer-stock/[id]/reject — Bayi stok girişini reddet.
 * (backend/src/admin/admin.service.ts → rejectDealerStock'tan taşındı)
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
    data: { adminApproved: false, adminNote: adminNote ?? 'Admin tarafından reddedildi.' },
  });

  await logActivity(gate.user.id, 'REJECT_DEALER_STOCK', 'DealerStock', id, { adminNote });

  return NextResponse.json(updated);
}
