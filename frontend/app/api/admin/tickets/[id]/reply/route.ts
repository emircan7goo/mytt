/**
 * PATCH /api/admin/tickets/[id]/reply — Talebe cevap yaz.
 * (backend/src/admin/admin.service.ts → replyToTicket'tan taşındı)
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
  const adminReply = body?.adminReply;
  if (typeof adminReply !== 'string' || !adminReply.trim()) {
    return NextResponse.json({ message: 'adminReply zorunludur.' }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ message: 'Talep bulunamadı' }, { status: 404 });

  const updated = await prisma.ticket.update({
    where: { id },
    data: { adminReply, status: 'IN_PROGRESS', repliedAt: new Date() },
  });

  await logActivity(gate.user.id, 'REPLY_TICKET', 'Ticket', id);

  return NextResponse.json(updated);
}
