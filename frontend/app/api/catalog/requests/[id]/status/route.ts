/**
 * PATCH /api/catalog/requests/[id]/status — [Admin] Stok talebi durumunu güncelle.
 * (backend/src/catalog/catalog.service.ts → updateStockRequestStatus'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (typeof status !== 'string' || !status) {
    return NextResponse.json({ message: 'status zorunludur.' }, { status: 400 });
  }

  const updated = await prisma.stockRequest.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
