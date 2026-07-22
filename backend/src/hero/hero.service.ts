import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero.dto';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  /** Public: Tüm aktif slide'ları sıra ile döndür */
  async findAllActive() {
    return this.prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  /** Admin: Tüm slide'lar (aktif olmayanlar da dahil) */
  async findAll() {
    return this.prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
  }

  /** Admin: Yeni slide ekle */
  async create(dto: CreateHeroSlideDto) {
    console.log('🎬 [HERO CREATE] DTO alındı:', JSON.stringify(dto, null, 2));
    try {
      const result = await this.prisma.heroSlide.create({
        data: {
          title:            dto.title || '',
          imageUrl:         dto.imageUrl ?? null,
          subtitle:         dto.subtitle || '',
          btnLeftText:      dto.btnLeftText || '',
          btnLeftLink:      dto.btnLeftLink || '',
          btnRightText:     dto.btnRightText || '',
          btnRightLink:     dto.btnRightLink || '',
          textColor:        dto.textColor || '#ffffff',
          textAlignment:    dto.textAlignment || 'left',
          overlayOpacity:   dto.overlayOpacity ?? 40,
          animationType:    dto.animationType || 'fade',
          buttonStyle:      dto.buttonStyle || 'solid',
          order:            dto.order ?? 0,
          isActive:         dto.isActive ?? true,
        },
      });
      console.log('✅ [HERO CREATE] Slide başarıyla oluşturuldu:', result.id);
      return result;
    } catch (err) {
      console.error('❌ [HERO CREATE] Hata:', err);
      throw err;
    }
  }

  /** Admin: Slide güncelle */
  async update(id: string, dto: UpdateHeroSlideDto) {
    await this.findOneOrFail(id);
    return this.prisma.heroSlide.update({
      where: { id },
      data: dto,
    });
  }

  /** Admin: Slide sil */
  async remove(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.heroSlide.delete({ where: { id } });
  }

  private async findOneOrFail(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException(`Hero slide #${id} bulunamadı`);
    return slide;
  }
}
