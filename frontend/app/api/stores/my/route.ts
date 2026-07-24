/**
 * GET /api/stores/my — Oturumdaki bayinin kendi mağazası (yoksa null döner).
 * (backend/src/store/store.service.ts → findByOwner'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const store = await prisma.store.findUnique({
    where: { ownerId: user.id },
    include: { owner: { select: { id: true, email: true, taxId: true } } },
  });

  return NextResponse.json(store);
}
