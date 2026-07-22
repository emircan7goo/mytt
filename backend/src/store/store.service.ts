import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, createStoreDto: CreateStoreDto) {
    const existingStore = await this.prisma.store.findUnique({
      where: { ownerId },
    });

    if (existingStore) {
      throw new ConflictException('You already have a store.');
    }

    return this.prisma.store.create({
      data: {
        ownerId,
        ...createStoreDto,
      },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, email: true },
        },
        products: true,
      },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  /** Oturumdaki kullanıcının kendi mağazasını döndürür */
  async findByOwner(ownerId: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId },
      include: {
        owner: { select: { id: true, email: true, taxId: true } },
      },
    });
    return store; // null dönebilir — henüz mağaza oluşturmamış bayi
  }

  async update(
    storeId: string,
    userId: string,
    updateStoreDto: UpdateStoreDto,
  ) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own store.');
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: updateStoreDto,
    });
  }

  async findPremium() {
    return this.prisma.store.findMany({
      where: { isPremium: true },
      take: 10,
      orderBy: { rating: 'desc' },
      include: {
        products: {
          take: 3,
          orderBy: { priority: 'desc' },
        },
      },
    });
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    // Input sanity — reject malformed coords / abusive radii before they reach PostGIS
    if (
      !Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180 ||
      radiusKm <= 0 || radiusKm > 500
    ) {
      throw new Error('Invalid geolocation parameters (lat/lng/radiusKm out of bounds).');
    }
    const radiusInMeters = radiusKm * 1000;

    // Use Prisma $queryRaw with template literals for safe parameterized queries
    const stores = await this.prisma.$queryRaw`
      SELECT s.id, s.name, s.rating, s.address, s.bio, s."logo", s."ownerId",
             ST_Distance(u.location::geography, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) as distance,
             ST_Y(u.location::geometry) as lat,
             ST_X(u.location::geometry) as lng
      FROM "Store" s
      JOIN "User" u ON s."ownerId" = u.id
      WHERE u.location IS NOT NULL
        AND ST_DWithin(
          u.location::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          ${radiusInMeters}
        )
      ORDER BY distance ASC
    `;

    return stores;
  }
}
