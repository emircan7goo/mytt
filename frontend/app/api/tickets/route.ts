/**
 * POST /api/tickets — Yeni destek talebi oluştur.
 * (backend/src/ticket/ticket.service.ts → createTicket'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER', 'CUSTOMER']);
  if (gate.error) return gate.error;

  const body = await req.json().catch(() => null);
  const subject = body?.subject;
  const message = body?.message;
  if (typeof subject !== 'string' || !subject.trim() || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ message: 'subject ve message zorunludur.' }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({ data: { dealerId: gate.user.id, subject, message } });
  return NextResponse.json(ticket, { status: 201 });
}
