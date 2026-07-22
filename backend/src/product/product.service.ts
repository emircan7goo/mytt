import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateCampaignDto } from './dto/product.dto';
import { Condition } from '@prisma/client';

type SortMode = 'price_asc' | 'price_desc' | 'newest' | 'sponsored';

interface ProductFilters {
  brand?:      string;
  condition?:  'NEW' | 'SECOND_HAND';
  minPrice?:   number;
  maxPrice?:   number;
  grade?:      string; // specsJson.cosmeticGrade
  batteryMin?: number; // specsJson.batteryHealth
  sort?:       SortMode;
  search?:     string;
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createProductDto: CreateProductDto) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId: userId },
    });

    if (!store) {
      throw new BadRequestException(
        'Ürün ekleyebilmek için önce bir mağaza açmanız gerekiyor.',
      );
    }

    return this.prisma.product.create({
      data: {
        storeId: store.id,
        ...createProductDto,
      },
    });
  }

  /**
   * Public vitrin — filtreler ve sıralama destekli.
   * Bayi kimliği (ownerId, email vs.) GÖNDERİLMEZ — ANONİMLİK KORUNUR.
   */
  async findAllPublic(filters: ProductFilters = {}) {
    const { brand, condition, minPrice, maxPrice, grade, batteryMin, sort, search } = filters;

    // Prisma where inşası
    const where: Record<string, unknown> = {};

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }
    if (condition) {
      where.condition = condition as Condition;
    }
    if (minPrice !== undefined) {
      where.price = { ...(where.price as object | undefined ?? {}), gte: minPrice };
    }
    if (maxPrice !== undefined) {
      where.price = { ...(where.price as object | undefined ?? {}), lte: maxPrice };
    }
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }

    // specsJson filtreleri (JSON path query — Prisma ileri seviye)
    // grade ve batteryHealth specsJson içinde, Prisma'nın JSON filter'ı ile:
    if (grade) {
      where.specsJson = {
        ...(where.specsJson as object | undefined ?? {}),
        path: ['cosmeticGrade'],
        equals: grade,
      };
    }
    // batteryHealth için ayrı sorgu (Prisma JSON path range desteklemez kolayca)
    // Bu yüzden application-level filter yapıyoruz.

    // Sıralama
    const orderBy = (() => {
      switch (sort) {
        case 'price_asc':  return [{ price: 'asc'  as const }];
        case 'price_desc': return [{ price: 'desc' as const }];
        case 'newest':     return [{ createdAt: 'desc' as const }];
        case 'sponsored':
        default:
          return [
            { isSponsored: 'desc' as const },
            { priority:    'desc' as const },
            { createdAt:   'desc' as const },
          ];
      }
    })();

    let products = await this.prisma.product.findMany({
      where,
      orderBy,
      include: {
        store: {
          select: {
            id:          true,
            rating:      true,
            reviewCount: true,
            jobsCompleted: true,
            isPremium:   true,
            // name/logo/ownerId intentionally NOT selected — dealer anonymity
          },
        },
      },
    });

    // Application-level batteryHealth filter (JSON path range limitation)
    if (batteryMin !== undefined) {
      products = products.filter((p) => {
        const specs = p.specsJson as Record<string, unknown> | null;
        const battery = specs?.batteryHealth as number | undefined;
        return battery === undefined || battery >= batteryMin;
      });
    }

    return products;
  }

  /**
   * Tek ürün detayı — ürün detay modalı ve sayfası için.
   * Bayi kimliği gizli tutulur.
   */
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id:           true,
            rating:       true,
            reviewCount:  true,
            jobsCompleted: true,
            isPremium:    true,
            // name/logo/bio/ownerId intentionally NOT exposed — dealer anonymity
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı.');
    }

    return product;
  }

  async findByStore(storeId: string) {
    return this.prisma.product.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Bayi kendi ürününe kampanya ekler / düzenler.
   */
  async updateCampaign(productId: string, userId: string, dto: UpdateCampaignDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: { select: { ownerId: true } } },
    });

    if (!product) throw new NotFoundException('Ürün bulunamadı.');
    if (product.store.ownerId !== userId) {
      throw new ForbiddenException('Sadece kendi ürünlerinizi düzenleyebilirsiniz.');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        isOnCampaign:    dto.isOnCampaign,
        discountedPrice: dto.discountedPrice ?? null,
        campaignTag:     dto.campaignTag     ?? null,
        campaignEndDate: dto.campaignEndDate ? new Date(dto.campaignEndDate) : null,
      },
    });
  }

  /**
   * Bayi kendi mağazasının ürün listesini stok ve kampanya bilgisiyle görür.
   */
  async findMyProducts(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) return [];

    return this.prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
