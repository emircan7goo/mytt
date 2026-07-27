/**
 * GET  /api/hero-slides — Public: tüm aktif hero slide'ları sıra ile döndürür.
 * POST /api/hero-slides — [Admin] Yeni slide ekle.
 * (backend/src/hero/hero.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  if (slides.length === 0) {
    return NextResponse.json([
      {
        id: 'default-hero',
        imageUrl: '',
        title: 'Cihazını En Yüksek Fiyata Sat,\nYenisini Sıfır Riskle Al.',
        subtitle: 'Yetkili bayilerin yarıştığı kapalı teklif sistemiyle cihazını 1 saatte en yüksek fiyata sat. Ya da 12 ay garantili, 32 noktada test edilmiş cihazları Escrow güvencesiyle satın al.',
        btnLeftText: 'Cihazını Hemen Sat',
        btnLeftLink: '/sell',
        btnRightText: 'Garantili Cihazları İncele',
        btnRightLink: '/',
        textAlignment: 'center',
        isActive: true,
      }
    ]);
  }

  // Eski varsayılan slides verisini de yeni temiz içerikle senkronize et
  const updatedSlides = slides.map(s => {
    if (s.title?.includes('Doğrulanmış') || s.title?.includes('Elite') || s.title?.includes('Güvenle')) {
      return {
        ...s,
        title: 'Cihazını En Yüksek Fiyata Sat,\nYenisini Sıfır Riskle Al.',
        subtitle: 'Yetkili bayilerin yarıştığı kapalı teklif sistemiyle cihazını 1 saatte en yüksek fiyata sat. Ya da 12 ay garantili, 32 noktada test edilmiş cihazları Escrow güvencesiyle satın al.',
        btnLeftText: 'Cihazını Hemen Sat',
        btnLeftLink: '/sell',
        btnRightText: 'Garantili Cihazları İncele',
        btnRightLink: '/',
      };
    }
    return s;
  });

  return NextResponse.json(updatedSlides);
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
