/**
 * PATCH  /api/hero-slides/[id] — [Admin] Slide güncelle.
 * DELETE /api/hero-slides/[id] — [Admin] Slide sil.
 * (backend/src/hero/hero.service.ts → update/remove'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const dto = await req.json().catch(() => null);
  if (!dto) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `Hero slide #${id} bulunamadı` }, { status: 404 });

  const updated = await prisma.heroSlide.update({ where: { id }, data: dto });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: `Hero slide #${id} bulunamadı` }, { status: 404 });

  await prisma.heroSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
