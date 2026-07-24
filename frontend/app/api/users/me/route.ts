/**
 * GET   /api/users/me — Profil bilgisi.
 * PATCH /api/users/me — İsim/telefon güncelle.
 * (backend/src/user/user.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, email: true, name: true, companyName: true, taxId: true,
      b2bStatus: true, commissionRate: true, createdAt: true,
    },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const dto = await req.json().catch(() => null);
  const name = typeof dto?.name === 'string' ? dto.name.slice(0, 80) : undefined;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...(name && { name }) },
    select: { id: true, email: true, name: true, b2bStatus: true, commissionRate: true },
  });

  return NextResponse.json(updated);
}
