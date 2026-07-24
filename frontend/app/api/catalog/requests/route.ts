/**
 * POST /api/catalog/requests — Bayi, kataloğda olmayan bir model için stok talebi açar.
 * (backend/src/catalog/catalog.service.ts → createStockRequest'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const dto = await req.json().catch(() => null);
  if (typeof dto?.modelName !== 'string' || !dto.modelName.trim()) {
    return NextResponse.json({ message: 'modelName zorunludur.' }, { status: 400 });
  }

  const request = await prisma.stockRequest.create({
    data: {
      userId: gate.user.id,
      modelName: dto.modelName,
      grade: dto.grade,
      maxPrice: dto.maxPrice ? new Prisma.Decimal(dto.maxPrice) : null,
      notes: dto.notes,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
