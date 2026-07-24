/**
 * GET /api/admin/tickets — Tüm destek taleplerini listele.
 * (backend/src/admin/admin.service.ts → getAllTickets'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { dealer: { select: { id: true, name: true, email: true, companyName: true } } },
  });

  return NextResponse.json(tickets);
}
