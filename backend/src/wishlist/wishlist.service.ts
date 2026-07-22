import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  /** Kullanıcının favori listesini döndürür */
  async getWishlist(userId: string) {
    const items = await this.prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        dealerStock: {
          include: {
            globalProduct: {
              select: {
                id: true,
                brand: true,
                model: true,
                storage: true,
                color: true,
                masterImages: true,
              },
            },
            store: {
              select: {
                id: true,
                rating: true,
                reviewCount: true,
                jobsCompleted: true,
                isPremium: true,
                // name/logo intentionally omitted — dealer anonymity
              },
            },
          },
        },
      },
    });

    return items.map(item => ({
      id:           item.id,
      dealerStockId:item.dealerStockId,
      addedAt:      item.createdAt,
      product: {
        id:           item.dealerStock.id,
        brand:        item.dealerStock.globalProduct.brand,
        model:        item.dealerStock.globalProduct.model,
        storage:      item.dealerStock.globalProduct.storage,
        color:        item.dealerStock.globalProduct.color,
        masterImage:  item.dealerStock.globalProduct.masterImages?.[0] ?? null,
        grade:        item.dealerStock.grade,
        batteryHealth:item.dealerStock.batteryHealth,
        price:        Number(item.dealerStock.price),
        stock:        item.dealerStock.stock,
        store:        item.dealerStock.store,
      },
    }));
  }

  /** Ürünü favorilere ekle (zaten varsa sessizce geç) */
  async addToWishlist(userId: string, dealerStockId: string) {
    // Ürün var mı kontrol et
    const stock = await this.prisma.dealerStock.findUnique({
      where: { id: dealerStockId },
    });
    if (!stock) throw new NotFoundException('Ürün bulunamadı');

    await this.prisma.wishlist.upsert({
      where:  { userId_dealerStockId: { userId, dealerStockId } },
      create: { userId, dealerStockId },
      update: {},
    });

    return { success: true, dealerStockId };
  }

  /** Ürünü favorilerden çıkar */
  async removeFromWishlist(userId: string, dealerStockId: string) {
    await this.prisma.wishlist.deleteMany({
      where: { userId, dealerStockId },
    });
    return { success: true, dealerStockId };
  }

  /** Kullanıcının favori ürün ID setini döndürür (hızlı kontrol için) */
  async getWishlistIds(userId: string): Promise<string[]> {
    const items = await this.prisma.wishlist.findMany({
      where:  { userId },
      select: { dealerStockId: true },
    });
    return items.map(i => i.dealerStockId);
  }
}
