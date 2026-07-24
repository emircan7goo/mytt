/**
 * GET /api/tickets/my — Kendi destek taleplerim.
 * (backend/src/ticket/ticket.service.ts → getMyTickets'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER', 'CUSTOMER']);
  if (gate.error) return gate.error;

  const tickets = await prisma.ticket.findMany({
    where: { dealerId: gate.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(tickets);
}
