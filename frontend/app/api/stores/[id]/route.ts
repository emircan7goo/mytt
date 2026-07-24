/**
 * GET /api/stores/[id]
 * (backend/src/store/store.service.ts → findOne'dan taşındı)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, email: true } },
      products: true,
    },
  });

  if (!store) {
    return NextResponse.json({ message: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json(store);
}
