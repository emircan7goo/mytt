/**
 * PATCH /api/admin/tickets/[id]/close — Talebi kapat.
 * (backend/src/admin/admin.service.ts → closeTicket'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const updated = await prisma.ticket.update({ where: { id }, data: { status: 'CLOSED' } });
  await logActivity(gate.user.id, 'CLOSE_TICKET', 'Ticket', id);

  return NextResponse.json(updated);
}
