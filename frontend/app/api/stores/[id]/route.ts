/**
 * GET   /api/stores/[id]
 * PATCH /api/stores/[id] — sadece mağaza sahibi güncelleyebilir.
 * (backend/src/store/store.service.ts → findOne/update'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const dto = await req.json().catch(() => null);
  if (!dto) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) return NextResponse.json({ message: 'Store not found' }, { status: 404 });
  if (store.ownerId !== user.id) {
    return NextResponse.json({ message: 'You can only update your own store.' }, { status: 403 });
  }

  const updated = await prisma.store.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.logo !== undefined && { logo: dto.logo }),
      ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.categories !== undefined && { categories: dto.categories }),
      ...(dto.detailedServices !== undefined && { detailedServices: dto.detailedServices }),
    },
  });

  return NextResponse.json(updated);
}
