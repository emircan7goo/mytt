/**
 * POST /api/admin/disputes/[id]/open — Siparişe anlaşmazlık aç.
 * (backend/src/admin/admin.service.ts → openDispute'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const type = body?.type;
  const note: string | undefined = body?.note;
  if (typeof type !== 'string' || !type) {
    return NextResponse.json({ message: 'type zorunludur.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ message: 'Sipariş bulunamadı' }, { status: 404 });

  const updated = await prisma.order.update({
    where: { id },
    data: { disputeStatus: 'OPEN', disputeType: type, disputeNote: note },
  });

  return NextResponse.json(updated);
}
