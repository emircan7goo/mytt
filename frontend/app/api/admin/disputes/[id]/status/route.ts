/**
 * PATCH /api/admin/disputes/[id]/status — Anlaşmazlık durumunu güncelle.
 * (backend/src/admin/admin.service.ts → updateDisputeStatus'tan taşındı)
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
  const status = body?.status;
  const note: string | undefined = body?.note;
  if (typeof status !== 'string' || !status) {
    return NextResponse.json({ message: 'status zorunludur.' }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { disputeStatus: status, ...(note && { disputeNote: note }) },
  });

  await logActivity(gate.user.id, 'RESOLVE_DISPUTE', 'Order', id, { disputeStatus: status, disputeNote: note });

  return NextResponse.json(updated);
}
