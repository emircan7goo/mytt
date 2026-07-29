/**
 * lib/familyFavorite.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Vitrindeki kartlar tekil ürün değil, marka+model AİLESİ (FamilySummary) gösterir;
 * dolayısıyla tekil bir ürün id'si yoktur. Kalp/favori butonlarının çalışması için
 * aileyi, mevcut favori store'unun (useWishlistStore, MockProduct[]) anlayacağı
 * minimal bir kayda çeviriyoruz. id `fam:<marka>:<model>` biçiminde olduğundan
 * /favoriler sayfası bunu tanıyıp doğru aile sayfasına (/urun/[brand]/[model])
 * yönlendirebilir.
 */
import type { MockProduct } from '@/lib/mock-data';
import type { FamilySummary } from '@/lib/hooks/useProducts';

export const FAMILY_FAV_PREFIX = 'fam:';

export function familyFavoriteId(brand: string, model: string): string {
  return `${FAMILY_FAV_PREFIX}${brand}:${model}`;
}

export function isFamilyFavoriteId(id: string): boolean {
  return id.startsWith(FAMILY_FAV_PREFIX);
}

/** `fam:Apple:iPhone 13` → { brand:'Apple', model:'iPhone 13' } */
export function parseFamilyFavoriteId(id: string): { brand: string; model: string } | null {
  if (!isFamilyFavoriteId(id)) return null;
  const rest = id.slice(FAMILY_FAV_PREFIX.length);
  const sep = rest.indexOf(':');
  if (sep === -1) return null;
  return { brand: rest.slice(0, sep), model: rest.slice(sep + 1) };
}

/**
 * FamilySummary → favori kaydı. MockProduct tipini tam doldurmuyoruz; favori
 * kartı yalnızca id/brand/model/price/image alanlarını kullanır, bu yüzden
 * bilinçli olarak minimal bir nesneyi cast ediyoruz.
 */
export function familyToFavorite(family: FamilySummary): MockProduct {
  return {
    id:            familyFavoriteId(family.brand, family.model),
    brand:         family.brand as MockProduct['brand'],
    model:         family.model,
    storage:       family.storageOptions?.[0] ?? '',
    color:         family.colorOptions?.[0] ?? '',
    price:         family.minPrice,
    originalPrice: family.maxPrice || family.minPrice,
    image:         family.masterImages?.[0] ?? '',
    images:        family.masterImages ?? [],
    inStock:       true,
    stockCount:    family.offerCount ?? 1,
  } as unknown as MockProduct;
}
