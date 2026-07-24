/**
 * GET /api/hero-slides
 * Public: tüm aktif hero slide'ları sıra ile döndürür.
 * (backend/src/hero/hero.service.ts → findAllActive'dan taşındı)
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(slides);
}
