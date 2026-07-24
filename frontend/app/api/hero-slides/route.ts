/**
 * GET  /api/hero-slides — Public: tüm aktif hero slide'ları sıra ile döndürür.
 * POST /api/hero-slides — [Admin] Yeni slide ekle.
 * (backend/src/hero/hero.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(slides);
}

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const dto = await req.json().catch(() => null) ?? {};

  const slide = await prisma.heroSlide.create({
    data: {
      title: dto.title || '',
      imageUrl: dto.imageUrl ?? null,
      subtitle: dto.subtitle || '',
      btnLeftText: dto.btnLeftText || '',
      btnLeftLink: dto.btnLeftLink || '',
      btnRightText: dto.btnRightText || '',
      btnRightLink: dto.btnRightLink || '',
      textColor: dto.textColor || '#ffffff',
      textAlignment: dto.textAlignment || 'left',
      overlayOpacity: dto.overlayOpacity ?? 40,
      animationType: dto.animationType || 'fade',
      buttonStyle: dto.buttonStyle || 'solid',
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    },
  });

  return NextResponse.json(slide, { status: 201 });
}
