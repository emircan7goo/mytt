/**
 * GET /api/payout/my-earnings — [Bayi] Hakediş özeti (bekleyen/çekilebilir/işlemde).
 * (backend/src/payout/payout.service.ts → getEarnings'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { getEarnings } from '@/lib/payout';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const earnings = await getEarnings(gate.user.id);
  return NextResponse.json(earnings);
}
