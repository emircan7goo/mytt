import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGlobalProductDto,
  UpdateGlobalProductDto,
  CreateDealerStockDto,
  UpdateDealerStockDto,
  CreateStockRequestDto,
} from './dto/catalog.dto';
import { BtkService } from '../btk/btk.service';
import { Prisma } from '@prisma/client';

const GRADE_RANK: Record<string, number> = { 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };

/**
 * "En hatasız / en güzel" sıralaması için kozmetik durum karşılaştırıcısı.
 * a, b'den daha iyi durumdaysa pozitif, kötüyse negatif, eşitse 0 döner.
 * Önce grade (A+ > A > B > C), eşitlikte pil sağlığı yüksek olan kazanır.
 */
function compareCondition(
  a: { grade: string; batteryHealth?: number | null },
  b: { grade: string; batteryHealth?: number | null },
): number {
  const rankDiff = (GRADE_RANK[a.grade] ?? 0) - (GRADE_RANK[b.grade] ?? 0);
  if (rankDiff !== 0) return rankDiff;
  return (a.batteryHealth ?? 0) - (b.batteryHealth ?? 0);
}

/** "256GB" → 256, "1TB" → 1024 — depolama seçeneklerini büyükten/küçükten sıralamak için. */
function storageToGB(s: string | null | undefined): number {
  if (!s) return 0;
  const m = s.match(/([\d.]+)\s*(GB|TB)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2].toUpperCase() === 'TB' ? n * 1024 : n;
}

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private btkService: BtkService,
  ) {}

  // ────────────────────────────────────────────────────────────────────────────
  // Global Katalog
  // ────────────────────────────────────────────────────────────────────────────

  async findAllGlobal(filters?: {
    brand?: string;
    search?: string;
    isActive?: boolean;
  }) {
    return this.prisma.globalProduct.findMany({
      where: {
        ...(filters?.brand && { brand: filters.brand }),
        ...(filters?.search && {
          OR: [
            { brand: { contains: filters.search, mode: 'insensitive' } },
            { model: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: {
        _count: { select: { dealerItems: true } }, // Kaç bayide var aggregation
      },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });
  }

  /**
   * Tek model + tüm bayi teklifleri (anonim karşılaştırma sayfası için).
   * sort: 'price_asc' (varsayılan) | 'price_desc' | 'best_condition'
   */
  async findGlobalById(id: string, sort: 'price_asc' | 'price_desc' | 'best_condition' = 'price_asc') {
    const product = await this.prisma.globalProduct.findUnique({
      where: { id },
      include: {
        dealerItems: {
          where: { stock: { gt: 0 }, adminApproved: true },
          include: {
            store: {
              select: {
                id: true,
                rating: true,
                reviewCount: true,
                jobsCompleted: true,
                isPremium: true,
                // name/logo/ownerId intentionally omitted — dealer anonymity
              },
            },
          },
        },
      },
    });

    if (!product) throw new NotFoundException('Ürün kataloğda bulunamadı.');

    const dealerItems = [...product.dealerItems].sort((a, b) => {
      if (sort === 'best_condition') return compareCondition(b, a);
      if (sort === 'price_desc') return Number(b.price) - Number(a.price);
      return Number(a.price) - Number(b.price); // price_asc
    });

    return { ...product, dealerItems };
  }

  /**
   * Public gruplu vitrin — her karttan bir model, altında kaç bayi teklifi
   * olduğu ve en düşük fiyat/en iyi durum bilgisi gelir. Bayi kimliği yok.
   */
  /**
   * Public gruplu vitrin — MARKA + MODEL bazlı (ör. "iPhone 12" tek kart).
   * Bir modelin tüm depolama/renk varyantları ve tüm bayi teklifleri
   * tek kartta özetlenir: kaç teklif, hangi kapasiteler, fiyat/pil aralığı.
   * Bayi kimliği hiçbir alanda yer almaz.
   */
  async findBrowseGrouped(filters: {
    brand?: string;
    search?: string;
    grade?: string;
    batteryMin?: number;
    minPrice?: number;
    maxPrice?: number;
    hasBox?: boolean;
    hasInvoice?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'best_condition' | 'newest' | 'popular';
    page?: number;
    limit?: number;
  }) {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 200;

    const stockWhere: Prisma.DealerStockWhereInput = {
      adminApproved: true,
      stock: { gt: 0 },
      ...(filters.grade      && { grade: filters.grade }),
      ...(filters.batteryMin !== undefined && { batteryHealth: { gte: filters.batteryMin } }),
      ...(filters.hasBox     !== undefined && { hasBox: filters.hasBox }),
      ...(filters.hasInvoice !== undefined && { hasInvoice: filters.hasInvoice }),
      ...(filters.minPrice   !== undefined && { price: { gte: new Prisma.Decimal(filters.minPrice) } }),
      ...(filters.maxPrice   !== undefined && { price: { lte: new Prisma.Decimal(filters.maxPrice) } }),
    };

    const variants = await this.prisma.globalProduct.findMany({
      where: {
        isActive: true,
        ...(filters.brand  && { brand: { equals: filters.brand, mode: 'insensitive' } }),
        ...(filters.search && {
          OR: [
            { brand: { contains: filters.search, mode: 'insensitive' } },
            { model: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
        dealerItems: { some: stockWhere },
      },
      include: {
        dealerItems: {
          where: stockWhere,
          select: { price: true, grade: true, batteryHealth: true, warrantyMonths: true, storeId: true, dealerImages: true },
        },
      },
    });

    // ── Marka + model anahtarıyla tüm varyantları tek ailede birleştir ──────
    interface FamilyAcc {
      brand: string;
      model: string;
      masterImages: string[];
      fallbackImages: string[];
      createdAt: Date;
      storageOptions: Set<string>;
      colorOptions: Set<string>;
      availableGrades: Set<string>;
      storeIds: Set<string>;
      offers: { price: number; grade: string; batteryHealth: number | null; hasWarranty: boolean }[];
    }
    const familyMap = new Map<string, FamilyAcc>();

    for (const v of variants) {
      const key = `${v.brand}|||${v.model}`;
      let fam = familyMap.get(key);
      if (!fam) {
        fam = {
          brand: v.brand, model: v.model,
          masterImages: [], fallbackImages: [], createdAt: v.createdAt,
          storageOptions: new Set(), colorOptions: new Set(),
          availableGrades: new Set(), storeIds: new Set(),
          offers: [],
        };
        familyMap.set(key, fam);
      }
      if (v.storage) fam.storageOptions.add(v.storage);
      if (v.color)   fam.colorOptions.add(v.color);
      if (fam.masterImages.length === 0 && v.masterImages.length > 0) fam.masterImages = v.masterImages;
      if (v.createdAt > fam.createdAt) fam.createdAt = v.createdAt;
      for (const o of v.dealerItems) {
        fam.availableGrades.add(o.grade);
        fam.storeIds.add(o.storeId);
        // Admin henüz "master" katalog görseli yüklemediyse, vitrin görseli
        // olarak bayinin yüklediği gerçek cihaz fotoğrafına düş (eski sistemle aynı davranış).
        if (fam.fallbackImages.length === 0 && o.dealerImages?.length > 0) fam.fallbackImages = o.dealerImages;
        fam.offers.push({
          price: Number(o.price),
          grade: o.grade,
          batteryHealth: o.batteryHealth,
          hasWarranty: !!o.warrantyMonths && o.warrantyMonths > 0,
        });
      }
    }

    let families = Array.from(familyMap.values())
      .filter((f) => f.offers.length > 0)
      .map((f) => {
        const prices    = f.offers.map((o) => o.price);
        const batteries = f.offers.map((o) => o.batteryHealth).filter((b): b is number => b != null);
        const best      = f.offers.reduce((a, b) => (compareCondition(b, a) > 0 ? b : a));
        return {
          brand: f.brand,
          model: f.model,
          masterImages: f.masterImages.length > 0 ? f.masterImages : f.fallbackImages,
          createdAt: f.createdAt,
          storageOptions: Array.from(f.storageOptions).sort((a, b) => storageToGB(a) - storageToGB(b)),
          colorOptions: Array.from(f.colorOptions),
          availableGrades: Array.from(f.availableGrades).sort((a, b) => (GRADE_RANK[b] ?? 0) - (GRADE_RANK[a] ?? 0)),
          storeIds: Array.from(f.storeIds),
          offerCount: f.offers.length,
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          batteryMin: batteries.length ? Math.min(...batteries) : null,
          batteryMax: batteries.length ? Math.max(...batteries) : null,
          bestGrade: best.grade,
          bestBatteryHealth: best.batteryHealth,
          hasWarrantyOffer: f.offers.some((o) => o.hasWarranty),
        };
      });

    switch (filters.sort) {
      case 'price_desc':
        families.sort((a, b) => b.minPrice - a.minPrice);
        break;
      case 'best_condition':
        families.sort((a, b) =>
          compareCondition(
            { grade: b.bestGrade, batteryHealth: b.bestBatteryHealth },
            { grade: a.bestGrade, batteryHealth: a.bestBatteryHealth },
          ),
        );
        break;
      case 'newest':
        families.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case 'popular':
        families.sort((a, b) => b.offerCount - a.offerCount);
        break;
      default: // price_asc
        families.sort((a, b) => a.minPrice - b.minPrice);
    }

    const total = families.length;
    const items = families.slice((page - 1) * limit, (page - 1) * limit + limit);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Bir marka+model ailesinin TÜM varyant (depolama/renk) ve TÜM bayi
   * tekliflerini birlikte döndürür — "tüm iPhone 12'ler" karşılaştırma sayfası.
   * Aralıklar (fiyat/pil/kapasite) her zaman ailenin TAMAMINDAN hesaplanır;
   * `items` listesi ise sayfadaki aktif filtrelere göre daralır.
   */
  async findFamilyDetail(
    brand: string,
    model: string,
    opts: {
      sort?: 'price_asc' | 'price_desc' | 'best_condition';
      storage?: string;
      grade?: string;
      batteryMin?: number;
      minPrice?: number;
      maxPrice?: number;
    } = {},
  ) {
    const variants = await this.prisma.globalProduct.findMany({
      where: { brand: { equals: brand, mode: 'insensitive' }, model: { equals: model, mode: 'insensitive' }, isActive: true },
    });
    if (!variants.length) throw new NotFoundException('Bu model kataloğda bulunamadı.');

    const variantIds = variants.map((v) => v.id);

    // Ailenin TAMAMI — aralık göstergeleri (128–256GB, %80–100, ₺X–Y) için
    const allOffers = await this.prisma.dealerStock.findMany({
      where: { adminApproved: true, stock: { gt: 0 }, globalProductId: { in: variantIds } },
      select: { price: true, batteryHealth: true, grade: true, globalProductId: true },
    });
    if (!allOffers.length) throw new NotFoundException('Bu model için şu anda aktif teklif yok.');

    const allPrices    = allOffers.map((o) => Number(o.price));
    const allBatteries = allOffers.map((o) => o.batteryHealth).filter((b): b is number => b != null);
    const offeredVariantIds = new Set(allOffers.map((o) => o.globalProductId));

    // Aktif filtrelere göre daralan liste
    const matchingVariantIds = opts.storage
      ? variants.filter((v) => v.storage === opts.storage).map((v) => v.id)
      : variantIds;

    const items = await this.prisma.dealerStock.findMany({
      where: {
        adminApproved: true,
        stock: { gt: 0 },
        globalProductId: { in: matchingVariantIds },
        ...(opts.grade      && { grade: opts.grade }),
        ...(opts.batteryMin !== undefined && { batteryHealth: { gte: opts.batteryMin } }),
        ...(opts.minPrice   !== undefined && { price: { gte: new Prisma.Decimal(opts.minPrice) } }),
        ...(opts.maxPrice   !== undefined && { price: { lte: new Prisma.Decimal(opts.maxPrice) } }),
      },
      include: {
        globalProduct: { select: { id: true, storage: true, color: true } },
        store: {
          select: {
            id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true,
            // name/logo/ownerId intentionally omitted — dealer anonymity
          },
        },
      },
    });

    const sorted = [...items].sort((a, b) => {
      if (opts.sort === 'best_condition') return compareCondition(b, a);
      if (opts.sort === 'price_desc') return Number(b.price) - Number(a.price);
      return Number(a.price) - Number(b.price); // price_asc (varsayılan)
    });

    // Admin "master" katalog görseli yüklemediyse, bayinin yüklediği gerçek
    // cihaz fotoğrafına düş (eski sistemle aynı davranış — vitrin hiç boş kalmasın).
    const masterImages =
      variants.find((v) => v.masterImages.length > 0)?.masterImages
      ?? sorted.find((o) => o.dealerImages?.length > 0)?.dealerImages
      ?? [];

    return {
      brand: variants[0].brand,
      model: variants[0].model,
      masterImages,
      specsJson: variants.find((v) => v.specsJson)?.specsJson ?? null,
      storageOptions: Array.from(new Set(
        variants.filter((v) => offeredVariantIds.has(v.id)).map((v) => v.storage).filter(Boolean) as string[],
      )).sort((a, b) => storageToGB(a) - storageToGB(b)),
      priceRange:   { min: Math.min(...allPrices), max: Math.max(...allPrices) },
      batteryRange: allBatteries.length ? { min: Math.min(...allBatteries), max: Math.max(...allBatteries) } : null,
      offerCount: allOffers.length,
      items: sorted,
    };
  }

  async createGlobal(dto: CreateGlobalProductDto) {
    return this.prisma.globalProduct.create({
      data: {
        brand:        dto.brand,
        model:        dto.model,
        storage:      dto.storage,
        color:        dto.color,
        masterImages: dto.masterImages ?? [],
        specsJson:    dto.specsJson as object,
        isActive:     dto.isActive ?? true,
      },
    });
  }

  async updateGlobal(id: string, dto: UpdateGlobalProductDto) {
    await this.findGlobalOrFail(id);
    return this.prisma.globalProduct.update({
      where: { id },
      data: {
        ...(dto.brand        !== undefined && { brand:        dto.brand }),
        ...(dto.model        !== undefined && { model:        dto.model }),
        ...(dto.storage      !== undefined && { storage:      dto.storage }),
        ...(dto.color        !== undefined && { color:        dto.color }),
        ...(dto.masterImages !== undefined && { masterImages: dto.masterImages }),
        ...(dto.specsJson    !== undefined && { specsJson:    dto.specsJson as object }),
        ...(dto.isActive     !== undefined && { isActive:     dto.isActive }),
      },
    });
  }

  async removeGlobal(id: string) {
    await this.findGlobalOrFail(id);
    return this.prisma.globalProduct.delete({ where: { id } });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Bayi Stok
  // ────────────────────────────────────────────────────────────────────────────

  /** Tekil stok detayı getir (Public) */
  async findDealerStockById(id: string) {
    const stock = await this.prisma.dealerStock.findUnique({
      where: { id },
      include: {
        globalProduct: {
          select: { brand: true, model: true, storage: true, color: true, masterImages: true, specsJson: true },
        },
        store: {
          select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true },
        },
      },
    });
    if (!stock) throw new NotFoundException('Stok kaydı bulunamadı.');
    return stock;
  }

  /** Bayinin kendi tüm stoklarını döndür */
  async findMyStock(userId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) return [];

    return this.prisma.dealerStock.findMany({
      where: { storeId: store.id },
      include: {
        globalProduct: {
          select: { brand: true, model: true, storage: true, color: true, masterImages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Filtrelenmiş stok listesi (public catalog — IMEI gizli) */
  async findFilteredStock(filters: {
    brand?: string;
    grade?: string;
    batteryMin?: number;
    minPrice?: number;
    maxPrice?: number;
    hasBox?: boolean;
    hasInvoice?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'grade_asc' | 'newest';
    page?: number;
    limit?: number;
  }) {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;

    const where: Record<string, unknown> = {
      stock:         { gt: 0 },
      adminApproved: true,          // Sadece admin onaylı stokları göster
      globalProduct: {
        isActive: true,
        ...(filters.brand && { brand: { equals: filters.brand, mode: 'insensitive' } }),
      },
      ...(filters.grade      && { grade:        filters.grade }),
      ...(filters.batteryMin && { batteryHealth: { gte: filters.batteryMin } }),
      ...(filters.minPrice !== undefined && {
        price: { gte: new Prisma.Decimal(filters.minPrice) },
      }),
      ...(filters.maxPrice !== undefined && {
        price: { lte: new Prisma.Decimal(filters.maxPrice) },
      }),
      ...(filters.hasBox     !== undefined && { hasBox:     filters.hasBox }),
      ...(filters.hasInvoice !== undefined && { hasInvoice: filters.hasInvoice }),
    };

    const orderBy = (() => {
      switch (filters.sort) {
        case 'price_asc':  return { price: 'asc'  as const };
        case 'price_desc': return { price: 'desc' as const };
        case 'newest':     return { createdAt: 'desc' as const };
        default:           return { price: 'asc'  as const };
      }
    })();

    const [items, total] = await this.prisma.$transaction([
      this.prisma.dealerStock.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          globalProduct: {
            select: {
              id: true, brand: true, model: true,
              storage: true, color: true, masterImages: true,
            },
          },
          store: {
            select: { id: true, rating: true, reviewCount: true, jobsCompleted: true, isPremium: true },
          },
        },
        // IMEI + name/logo + diğer hassas alanlar intentionally excluded — dealer anonymity
      }),
      this.prisma.dealerStock.count({ where }),
    ]);

    // Aynı modelin toplam kaç aktif teklifi var — karşılaştırma sayfasına yönlendirmek için
    // (mevcut filtreden bağımsız, modelin genel teklif sayısı)
    const offerCounts = await this.prisma.dealerStock.groupBy({
      by: ['globalProductId'],
      where: { adminApproved: true, stock: { gt: 0 } },
      _count: { _all: true },
    });
    const countMap = new Map(offerCounts.map((o) => [o.globalProductId, o._count._all]));
    const itemsWithOfferCount = items.map((i) => ({
      ...i,
      offerCount: countMap.get(i.globalProductId) ?? 1,
    }));

    return { items: itemsWithOfferCount, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Bayi yeni stok ekler */
  async addDealerStock(userId: string, dto: CreateDealerStockDto) {
    let store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) {
      // Onaylanmış ama mağazası olmayan eski bayiler için otomatik oluştur
      const app = await this.prisma.dealerApplication.findUnique({ where: { userId } });
      store = await this.prisma.store.create({
        data: {
          ownerId: userId,
          name:    app?.companyName ?? 'Bayi Mağazası',
        },
      });
    }

    if (!dto.dealerImages || dto.dealerImages.length < 3) {
      throw new BadRequestException('Cihazın gerçekten elinizde olduğunu kanıtlamak için en az 3 fotoğraf yüklenmesi zorunludur.');
    }

    // Katalogda ürün var mı?
    const globalProduct = await this.prisma.globalProduct.findUnique({
      where: { id: dto.globalProductId },
    });
    if (!globalProduct) throw new NotFoundException('Katalog ürünü bulunamadı.');

    // Validate IMEI using BTK service if provided
    if (dto.imei) {
      this.btkService.validateImei(dto.imei);
    }

    return this.prisma.dealerStock.create({
      data: {
        globalProductId: dto.globalProductId,
        storeId:         store.id,
        grade:           dto.grade,
        batteryHealth:   dto.batteryHealth,
        hasBox:          dto.hasBox ?? false,
        hasInvoice:      dto.hasInvoice ?? false,
        hasAccessories:  dto.hasAccessories ?? false,
        warrantyMonths:  dto.warrantyMonths,
        imei:            dto.imei,
        dealerImages:    dto.dealerImages,
        price:           new Prisma.Decimal(dto.price),
        stock:           dto.stock ?? 1,
        notes:           dto.notes,
      },
    });
  }

  /** Bayi kendi stok kaydını günceller */
  async updateDealerStock(userId: string, stockId: string, dto: UpdateDealerStockDto) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) throw new ForbiddenException();

    const stock = await this.prisma.dealerStock.findUnique({ where: { id: stockId } });
    if (!stock) throw new NotFoundException('Stok kaydı bulunamadı.');
    if (stock.storeId !== store.id) throw new ForbiddenException('Bu stok kaydı size ait değil.');

    return this.prisma.dealerStock.update({
      where: { id: stockId },
      data: {
        ...(dto.grade          !== undefined && { grade:          dto.grade }),
        ...(dto.batteryHealth  !== undefined && { batteryHealth:  dto.batteryHealth }),
        ...(dto.hasBox         !== undefined && { hasBox:         dto.hasBox }),
        ...(dto.hasInvoice     !== undefined && { hasInvoice:     dto.hasInvoice }),
        ...(dto.hasAccessories !== undefined && { hasAccessories: dto.hasAccessories }),
        ...(dto.warrantyMonths !== undefined && { warrantyMonths: dto.warrantyMonths }),
        ...(dto.price          !== undefined && { price:          new Prisma.Decimal(dto.price) }),
        ...(dto.stock          !== undefined && { stock:          dto.stock }),
        ...(dto.dealerImages   !== undefined && { dealerImages:   dto.dealerImages }),
        ...(dto.notes          !== undefined && { notes:          dto.notes }),
      },
    });
  }

  /** Bayi kendi stok kaydını siler */
  async removeDealerStock(userId: string, stockId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId: userId } });
    if (!store) throw new ForbiddenException();

    const stock = await this.prisma.dealerStock.findUnique({ where: { id: stockId } });
    if (!stock) throw new NotFoundException('Stok bulunamadı.');
    if (stock.storeId !== store.id) throw new ForbiddenException();

    return this.prisma.dealerStock.delete({ where: { id: stockId } });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Admin — Tüm Bayi Stokları (IMEI dahil)
  // ────────────────────────────────────────────────────────────────────────────

  async findAllStockAdmin(filters?: {
    brand?:  string;
    grade?:  string;
    search?: string;
    page?:   number;
    limit?:  number;
  }) {
    const page  = filters?.page  ?? 1;
    const limit = filters?.limit ?? 20;

    const where: Record<string, unknown> = {
      ...(filters?.grade && { grade: filters.grade }),
      ...((filters?.brand || filters?.search) && {
        globalProduct: {
          ...(filters.brand  && { brand: { equals: filters.brand, mode: 'insensitive' } }),
          ...(filters.search && {
            OR: [
              { brand: { contains: filters.search, mode: 'insensitive' } },
              { model: { contains: filters.search, mode: 'insensitive' } },
            ],
          }),
        },
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.dealerStock.findMany({
        where,
        include: {
          globalProduct: {
            select: { id: true, brand: true, model: true, storage: true, color: true, masterImages: true },
          },
          store: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dealerStock.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Stok Talepleri
  // ────────────────────────────────────────────────────────────────────────────

  async createStockRequest(userId: string, dto: CreateStockRequestDto) {
    return this.prisma.stockRequest.create({
      data: {
        userId,
        modelName: dto.modelName,
        grade:     dto.grade,
        maxPrice:  dto.maxPrice ? new Prisma.Decimal(dto.maxPrice) : null,
        notes:     dto.notes,
      },
    });
  }

  async getMyStockRequests(userId: string) {
    return this.prisma.stockRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllStockRequests() {
    return this.prisma.stockRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStockRequestStatus(id: string, status: string) {
    return this.prisma.stockRequest.update({
      where: { id },
      data: { status },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Toplu Katalog Seed (Admin panelden tek tıkla)
  // ────────────────────────────────────────────────────────────────────────────

  async bulkSeedCatalog(): Promise<{ inserted: number; total: number }> {
    const v = (brand: string, model: string, storages: string[]) =>
      storages.map(storage => ({ brand, model, storage, color: null as string | null, isActive: true }));

    const data = [
      // ── Apple (iPhone X → 17 Pro Max) ────────────────────────────────────────
      ...v('Apple','iPhone X',          ['64GB','256GB']),
      ...v('Apple','iPhone XS',         ['64GB','256GB','512GB']),
      ...v('Apple','iPhone XS Max',     ['64GB','256GB','512GB']),
      ...v('Apple','iPhone XR',         ['64GB','128GB','256GB']),
      ...v('Apple','iPhone 11',         ['64GB','128GB','256GB']),
      ...v('Apple','iPhone 11 Pro',     ['64GB','256GB','512GB']),
      ...v('Apple','iPhone 11 Pro Max', ['64GB','256GB','512GB']),
      ...v('Apple','iPhone 12',         ['64GB','128GB','256GB']),
      ...v('Apple','iPhone 12 mini',    ['64GB','128GB','256GB']),
      ...v('Apple','iPhone 12 Pro',     ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 12 Pro Max', ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 13',         ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 13 mini',    ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 13 Pro',     ['128GB','256GB','512GB','1TB']),
      ...v('Apple','iPhone 13 Pro Max', ['128GB','256GB','512GB','1TB']),
      ...v('Apple','iPhone 14',         ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 14 Plus',    ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 14 Pro',     ['128GB','256GB','512GB','1TB']),
      ...v('Apple','iPhone 14 Pro Max', ['128GB','256GB','512GB','1TB']),
      ...v('Apple','iPhone 15',         ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 15 Plus',    ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 15 Pro',     ['256GB','512GB','1TB']),
      ...v('Apple','iPhone 15 Pro Max', ['256GB','512GB','1TB']),
      ...v('Apple','iPhone 16',         ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 16 Plus',    ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 16 Pro',     ['256GB','512GB','1TB']),
      ...v('Apple','iPhone 16 Pro Max', ['256GB','512GB','1TB']),
      ...v('Apple','iPhone 17',         ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 17 Plus',    ['128GB','256GB','512GB']),
      ...v('Apple','iPhone 17 Pro',     ['256GB','512GB','1TB']),
      ...v('Apple','iPhone 17 Pro Max', ['256GB','512GB','1TB']),
      // ── Samsung ───────────────────────────────────────────────────────────────
      ...v('Samsung','Galaxy S23',        ['128GB','256GB']),
      ...v('Samsung','Galaxy S23+',       ['256GB','512GB']),
      ...v('Samsung','Galaxy S23 Ultra',  ['256GB','512GB','1TB']),
      ...v('Samsung','Galaxy S23 FE',     ['128GB','256GB']),
      ...v('Samsung','Galaxy S24',        ['128GB','256GB']),
      ...v('Samsung','Galaxy S24+',       ['256GB','512GB']),
      ...v('Samsung','Galaxy S24 Ultra',  ['256GB','512GB','1TB']),
      ...v('Samsung','Galaxy S24 FE',     ['128GB','256GB']),
      ...v('Samsung','Galaxy S25',        ['128GB','256GB','512GB']),
      ...v('Samsung','Galaxy S25+',       ['256GB','512GB']),
      ...v('Samsung','Galaxy S25 Ultra',  ['256GB','512GB','1TB']),
      ...v('Samsung','Galaxy A05',        ['64GB','128GB']),
      ...v('Samsung','Galaxy A05s',       ['64GB','128GB']),
      ...v('Samsung','Galaxy A15',        ['128GB']),
      ...v('Samsung','Galaxy A15 5G',     ['128GB','256GB']),
      ...v('Samsung','Galaxy A16',        ['128GB','256GB']),
      ...v('Samsung','Galaxy A16 5G',     ['128GB','256GB']),
      ...v('Samsung','Galaxy A25',        ['128GB','256GB']),
      ...v('Samsung','Galaxy A35',        ['128GB','256GB']),
      ...v('Samsung','Galaxy A36',        ['128GB','256GB']),
      ...v('Samsung','Galaxy A54',        ['128GB','256GB']),
      ...v('Samsung','Galaxy A55',        ['128GB','256GB']),
      ...v('Samsung','Galaxy A56',        ['128GB','256GB']),
      ...v('Samsung','Galaxy Z Fold 5',   ['256GB','512GB','1TB']),
      ...v('Samsung','Galaxy Z Fold 6',   ['256GB','512GB','1TB']),
      ...v('Samsung','Galaxy Z Flip 5',   ['256GB','512GB']),
      ...v('Samsung','Galaxy Z Flip 6',   ['256GB','512GB']),
      ...v('Samsung','Galaxy M15',        ['128GB']),
      ...v('Samsung','Galaxy M35',        ['128GB','256GB']),
      ...v('Samsung','Galaxy M55',        ['128GB','256GB']),
      // ── Xiaomi ────────────────────────────────────────────────────────────────
      ...v('Xiaomi','Xiaomi 12',        ['128GB','256GB']),
      ...v('Xiaomi','Xiaomi 12 Pro',    ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 13',        ['128GB','256GB']),
      ...v('Xiaomi','Xiaomi 13 Pro',    ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 13 Lite',   ['128GB','256GB']),
      ...v('Xiaomi','Xiaomi 13T',       ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 13T Pro',   ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 14',        ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 14 Pro',    ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 14 Ultra',  ['256GB','512GB','1TB']),
      ...v('Xiaomi','Xiaomi 14T',       ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 14T Pro',   ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 15',        ['256GB','512GB']),
      ...v('Xiaomi','Xiaomi 15 Pro',    ['256GB','512GB','1TB']),
      ...v('Xiaomi','Xiaomi 15 Ultra',  ['512GB','1TB']),
      // ── Redmi ─────────────────────────────────────────────────────────────────
      ...v('Redmi','Redmi 12',              ['128GB','256GB']),
      ...v('Redmi','Redmi 12C',             ['64GB','128GB']),
      ...v('Redmi','Redmi 13',              ['128GB','256GB']),
      ...v('Redmi','Redmi 13C',             ['64GB','128GB','256GB']),
      ...v('Redmi','Redmi A3',              ['64GB','128GB']),
      ...v('Redmi','Redmi A3x',             ['64GB','128GB']),
      ...v('Redmi','Redmi Note 12',         ['128GB','256GB']),
      ...v('Redmi','Redmi Note 12 Pro',     ['128GB','256GB']),
      ...v('Redmi','Redmi Note 12 Pro+',    ['256GB','512GB']),
      ...v('Redmi','Redmi Note 12S',        ['128GB','256GB']),
      ...v('Redmi','Redmi Note 13',         ['128GB','256GB']),
      ...v('Redmi','Redmi Note 13 Pro',     ['256GB','512GB']),
      ...v('Redmi','Redmi Note 13 Pro+',    ['256GB','512GB']),
      ...v('Redmi','Redmi Note 13 4G',      ['128GB','256GB']),
      ...v('Redmi','Redmi Note 14',         ['128GB','256GB']),
      ...v('Redmi','Redmi Note 14 Pro',     ['256GB','512GB']),
      ...v('Redmi','Redmi Note 14 Pro+',    ['256GB','512GB']),
      ...v('Redmi','Redmi Note 14 4G',      ['128GB','256GB']),
      // ── POCO ──────────────────────────────────────────────────────────────────
      ...v('POCO','POCO X5',       ['128GB','256GB']),
      ...v('POCO','POCO X5 Pro',   ['128GB','256GB']),
      ...v('POCO','POCO X6',       ['256GB','512GB']),
      ...v('POCO','POCO X6 Pro',   ['256GB','512GB']),
      ...v('POCO','POCO X6 Neo',   ['256GB']),
      ...v('POCO','POCO X7',       ['256GB','512GB']),
      ...v('POCO','POCO X7 Pro',   ['256GB','512GB']),
      ...v('POCO','POCO F5',       ['128GB','256GB']),
      ...v('POCO','POCO F5 Pro',   ['256GB','512GB']),
      ...v('POCO','POCO F6',       ['256GB','512GB']),
      ...v('POCO','POCO F6 Pro',   ['256GB','512GB']),
      ...v('POCO','POCO M6',       ['128GB','256GB']),
      ...v('POCO','POCO M6 Pro',   ['128GB','256GB']),
      ...v('POCO','POCO M6 Plus',  ['128GB','256GB']),
      ...v('POCO','POCO C65',      ['128GB','256GB']),
      ...v('POCO','POCO C75',      ['128GB','256GB']),
      // ── Huawei ────────────────────────────────────────────────────────────────
      ...v('Huawei','Huawei P50',            ['128GB','256GB']),
      ...v('Huawei','Huawei P50 Pro',        ['256GB','512GB']),
      ...v('Huawei','Huawei P60',            ['128GB','256GB']),
      ...v('Huawei','Huawei P60 Pro',        ['256GB','512GB']),
      ...v('Huawei','Huawei P60 Art',        ['512GB','1TB']),
      ...v('Huawei','Huawei Pura 70',        ['256GB','512GB']),
      ...v('Huawei','Huawei Pura 70 Pro',    ['256GB','512GB','1TB']),
      ...v('Huawei','Huawei Pura 70 Ultra',  ['512GB','1TB']),
      ...v('Huawei','Huawei Mate 50',        ['128GB','256GB']),
      ...v('Huawei','Huawei Mate 50 Pro',    ['256GB','512GB']),
      ...v('Huawei','Huawei Mate 60',        ['256GB','512GB']),
      ...v('Huawei','Huawei Mate 60 Pro',    ['256GB','512GB','1TB']),
      ...v('Huawei','Huawei Mate X5',        ['512GB','1TB']),
      ...v('Huawei','Huawei nova 11',        ['128GB','256GB']),
      ...v('Huawei','Huawei nova 11 Pro',    ['256GB','512GB']),
      ...v('Huawei','Huawei nova 12',        ['128GB','256GB']),
      ...v('Huawei','Huawei nova 12 Pro',    ['256GB','512GB']),
      ...v('Huawei','Huawei nova 12 SE',     ['128GB','256GB']),
      ...v('Huawei','Huawei nova 13',        ['256GB']),
      // ── Vivo ──────────────────────────────────────────────────────────────────
      ...v('Vivo','Vivo X90',        ['256GB']),
      ...v('Vivo','Vivo X90 Pro',    ['256GB','512GB']),
      ...v('Vivo','Vivo X100',       ['256GB','512GB']),
      ...v('Vivo','Vivo X100 Pro',   ['256GB','512GB','1TB']),
      ...v('Vivo','Vivo X200',       ['256GB','512GB']),
      ...v('Vivo','Vivo X200 Pro',   ['256GB','512GB','1TB']),
      ...v('Vivo','Vivo V29',        ['256GB']),
      ...v('Vivo','Vivo V29 Pro',    ['256GB']),
      ...v('Vivo','Vivo V30',        ['128GB','256GB']),
      ...v('Vivo','Vivo V30 Pro',    ['256GB','512GB']),
      ...v('Vivo','Vivo V40',        ['256GB','512GB']),
      ...v('Vivo','Vivo V40 Pro',    ['256GB','512GB']),
      ...v('Vivo','Vivo V40 Lite',   ['128GB','256GB']),
      ...v('Vivo','Vivo Y200',       ['128GB','256GB']),
      ...v('Vivo','Vivo Y200 Pro',   ['256GB']),
      ...v('Vivo','Vivo Y38',        ['128GB','256GB']),
      ...v('Vivo','Vivo Y28',        ['128GB','256GB']),
      ...v('Vivo','Vivo Y18',        ['128GB']),
      // ── Tecno ─────────────────────────────────────────────────────────────────
      ...v('Tecno','Tecno Camon 20',          ['256GB']),
      ...v('Tecno','Tecno Camon 20 Pro',      ['256GB','512GB']),
      ...v('Tecno','Tecno Camon 20 Premier',  ['512GB']),
      ...v('Tecno','Tecno Camon 30',          ['256GB','512GB']),
      ...v('Tecno','Tecno Camon 30 Pro',      ['256GB','512GB']),
      ...v('Tecno','Tecno Phantom X2',        ['256GB','512GB']),
      ...v('Tecno','Tecno Phantom X2 Pro',    ['256GB','512GB']),
      ...v('Tecno','Tecno Phantom V Fold',    ['512GB']),
      ...v('Tecno','Tecno Spark 20',          ['128GB','256GB']),
      ...v('Tecno','Tecno Spark 20 Pro',      ['128GB','256GB']),
      ...v('Tecno','Tecno Spark 20 Pro+',     ['256GB']),
      ...v('Tecno','Tecno Spark 30',          ['128GB','256GB']),
      ...v('Tecno','Tecno Pova 6',            ['128GB','256GB']),
      ...v('Tecno','Tecno Pova 6 Pro',        ['256GB']),
      ...v('Tecno','Tecno Pop 8',             ['64GB','128GB']),
      ...v('Tecno','Tecno Pop 9',             ['128GB','256GB']),
      // ── Infinix ───────────────────────────────────────────────────────────────
      ...v('Infinix','Infinix Note 30',       ['128GB','256GB']),
      ...v('Infinix','Infinix Note 30 Pro',   ['128GB','256GB']),
      ...v('Infinix','Infinix Note 30 VIP',   ['256GB','512GB']),
      ...v('Infinix','Infinix Note 40',       ['256GB']),
      ...v('Infinix','Infinix Note 40 Pro',   ['256GB','512GB']),
      ...v('Infinix','Infinix Note 40 Pro+',  ['256GB','512GB']),
      ...v('Infinix','Infinix Zero 30',       ['256GB']),
      ...v('Infinix','Infinix Zero 30 5G',    ['256GB']),
      ...v('Infinix','Infinix Zero 40',       ['256GB','512GB']),
      ...v('Infinix','Infinix Hot 40',        ['128GB','256GB']),
      ...v('Infinix','Infinix Hot 40i',       ['128GB','256GB']),
      ...v('Infinix','Infinix Hot 40 Pro',    ['128GB','256GB']),
      ...v('Infinix','Infinix Smart 8',       ['64GB','128GB']),
      ...v('Infinix','Infinix Smart 8 Plus',  ['64GB','128GB']),
      // ── Realme ────────────────────────────────────────────────────────────────
      ...v('Realme','Realme 11',            ['128GB','256GB']),
      ...v('Realme','Realme 11 Pro',        ['128GB','256GB']),
      ...v('Realme','Realme 11 Pro+',       ['256GB','512GB']),
      ...v('Realme','Realme 12',            ['128GB','256GB']),
      ...v('Realme','Realme 12 Pro',        ['128GB','256GB']),
      ...v('Realme','Realme 12 Pro+',       ['256GB','512GB']),
      ...v('Realme','Realme 12x',           ['128GB','256GB']),
      ...v('Realme','Realme 13',            ['128GB','256GB']),
      ...v('Realme','Realme 13 Pro',        ['256GB','512GB']),
      ...v('Realme','Realme 13 Pro+',       ['256GB','512GB']),
      ...v('Realme','Realme GT 6',          ['256GB','512GB','1TB']),
      ...v('Realme','Realme GT 6T',         ['256GB','512GB']),
      ...v('Realme','Realme GT Neo 6',      ['256GB','512GB']),
      ...v('Realme','Realme C65',           ['128GB','256GB']),
      ...v('Realme','Realme C67',           ['128GB','256GB']),
      ...v('Realme','Realme C75',           ['128GB','256GB']),
      ...v('Realme','Realme Narzo 70',      ['128GB','256GB']),
      ...v('Realme','Realme Narzo 70 Pro',  ['128GB','256GB']),
    ];

    const result = await this.prisma.globalProduct.createMany({
      data,
      skipDuplicates: true,
    });

    const total = await this.prisma.globalProduct.count();
    return { inserted: result.count, total };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────────

  private async findGlobalOrFail(id: string) {
    const product = await this.prisma.globalProduct.findUnique({ where: { id } });
    if (!product) throw new NotFoundException(`GlobalProduct #${id} bulunamadı.`);
    return product;
  }
}
