/**
 * POST /api/stores — Bayi kendi mağazasını oluşturur (kişi başı bir tane).
 * (backend/src/store/store.service.ts → create'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const dto = await req.json().catch(() => null);
  if (typeof dto?.name !== 'string' || !dto.name.trim()) {
    return NextResponse.json({ message: 'name zorunludur.' }, { status: 400 });
  }

  const existing = await prisma.store.findUnique({ where: { ownerId: gate.user.id } });
  if (existing) {
    return NextResponse.json({ message: 'You already have a store.' }, { status: 409 });
  }

  const store = await prisma.store.create({
    data: {
      ownerId: gate.user.id,
      name: dto.name,
      logo: dto.logo,
      coverImage: dto.coverImage,
      address: dto.address,
      bio: dto.bio,
    },
  });

  return NextResponse.json(store, { status: 201 });
}
