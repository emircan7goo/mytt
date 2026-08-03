/**
 * lib/hooks/useProducts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * DATA FETCHING LAYER — LIVE DATABASE
 *
 * Backend: NestJS on port 3001
 * Endpoints: GET /products, GET /products/:id
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import apiClient from '../api';
import { API_BASE } from '../apiBase';

// ── API Product type (matches backend Prisma output) ─────────────────────────
export interface ApiProduct {
  id: string;
  storeId: string;
  brand: string;
  model: string;
  condition: 'NEW' | 'SECOND_HAND';
  price: number;
  stock: number;
  specsJson: Record<string, unknown> | null;
  imagesUrl: string[];
  isSponsored: boolean;
  priority: number;
  isOnCampaign: boolean;
  discountedPrice: number | null;
  campaignTag: string | null;
  campaignEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  // Anonim bayi bilgisi — name/logo/ownerId ASLA gönderilmez (kimlik gizliliği)
  store: {
    id: string;
    rating: number;
    reviewCount: number;
    isPremium: boolean;
    jobsCompleted?: number;
  } | null;
  globalProductId?: string;
  offerCount?: number;
  // Compatibility aliases for components expecting old shape
  image?: string;
  color?: string;
  storage?: string;
  // Vitrin görseli: masterImage (admin yüklediği temiz PNG) — kart görünümünde kullanılır
  // Bayi fotoğrafları (dealerImages) detay sayfasında gösterilir, kart/vitrin'de değil
  masterImage?: string;
  grade?: string | null;          // A+, A, B, C
  batteryHealth?: number | null;
  hasBox?: boolean;
  warrantyMonths?: number | null;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────
async function fetchProductsFromAPI(signal?: AbortSignal): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ items: any[] }>(`/catalog/stock/list`, { signal });
  const mapped = data.items.map(normalizeProduct);
  return mapped;
}

async function fetchProductByIdFromAPI(id: string, signal?: AbortSignal): Promise<ApiProduct> {
  const { data } = await apiClient.get<any>(`/catalog/stock/public/${id}`, { signal });
  return normalizeProduct(data);
}

function normalizeProduct(p: any): ApiProduct {
  const gp    = p.globalProduct || {};
  const specs = gp.specsJson   || {};

  const dealerImgs: string[] = Array.isArray(p.dealerImages)  ? p.dealerImages  : [];
  const masterImgs: string[] = Array.isArray(gp.masterImages) ? gp.masterImages : [];

  // Vitrin/kart görseli: admin masterImage varsa onu kullan (temiz katalog PNG),
  // yoksa bayi fotoğraflarından ilkini göster (admin yüklemediyse boş kalmasın)
  const masterImage = masterImgs[0] ?? dealerImgs[0] ?? '';

  // Detay sayfası: önce bayi fotoğrafları (gerçek durum), sonra master
  const allImages   = dealerImgs.length > 0 ? dealerImgs : masterImgs;

  return {
    ...p,
    id:            p.id,
    brand:         gp.brand  || '',
    model:         gp.model  || '',
    condition:     (p.condition === 'NEW' || p.condition === 'SECOND_HAND') ? p.condition : 'SECOND_HAND',
    price:         Number(p.price) || 0,
    stock:         p.stock   || 0,
    imagesUrl:     allImages,
    image:         allImages[0] ?? '',
    masterImage,                        // ← kart vitrin görseli (temiz PNG)
    color:         gp.color   ?? '',
    storage:       gp.storage ?? '',
    grade:         p.grade         ?? null,
    batteryHealth: p.batteryHealth ?? null,
    hasBox:        p.hasBox        ?? false,
    warrantyMonths:p.warrantyMonths ?? null,
    specsJson: {
      ...specs,
      cosmeticGrade: p.grade,
      batteryHealth: p.batteryHealth,
    },
    store: p.store || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// useProducts — Full product list (filterable client-side)
// ─────────────────────────────────────────────────────────────────────────────
export function useProducts(
  filters?: { brands?: string[]; query?: string }
): UseQueryResult<ApiProduct[], Error> {
  return useQuery<ApiProduct[], Error>({
    queryKey: ['products', { filters }],
    queryFn: async ({ signal }) => {
      let products = await fetchProductsFromAPI(signal);

      if (filters?.brands?.length) {
        products = products.filter((p) => filters.brands!.includes(p.brand));
      }
      if (filters?.query?.trim()) {
        const q = filters.query.toLowerCase();
        products = products.filter(
          (p) =>
            p.brand.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            (p.storage ?? '').toLowerCase().includes(q) ||
            (p.color ?? '').toLowerCase().includes(q)
        );
      }
      return products;
    },
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// useProductById — Single product detail
// ─────────────────────────────────────────────────────────────────────────────
export function useProductById(
  id: string | null
): UseQueryResult<ApiProduct | null, Error> {
  return useQuery<ApiProduct | null, Error>({
    queryKey: ['product', id],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      return fetchProductByIdFromAPI(id, signal);
    },
    enabled: !!id,
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Family (marka + model) — bir modelin TÜM depolama/renk varyantları ve TÜM
// bayi teklifleri birlikte. Anonim karşılaştırma sayfası: /urun/[brand]/[model]
// ─────────────────────────────────────────────────────────────────────────────
export type ComparisonSort = 'price_asc' | 'price_desc' | 'best_condition';
export type BrowseSort = ComparisonSort | 'newest' | 'popular';

export interface DealerOffer {
  id: string;
  grade: string;
  batteryHealth: number | null;
  hasBox: boolean;
  hasInvoice: boolean;
  hasAccessories: boolean;
  warrantyMonths: number | null;
  price: string;
  stock: number;
  notes: string | null;
  globalProduct?: { id: string; storage: string | null; color: string | null };
  store: {
    id: string;
    rating: number;
    reviewCount?: number;
    jobsCompleted?: number;
    isPremium: boolean;
  } | null;
}

export interface FamilyDetail {
  brand: string;
  model: string;
  masterImages: string[];
  specsJson: Record<string, unknown> | null;
  storageOptions: string[];
  priceRange: { min: number; max: number };
  batteryRange: { min: number; max: number } | null;
  offerCount: number;
  items: DealerOffer[];
}

export interface FamilySummary {
  brand: string;
  model: string;
  masterImages: string[];
  createdAt: string;
  storageOptions: string[];
  colorOptions: string[];
  availableGrades: string[];
  storeIds: string[];
  offerCount: number;
  minPrice: number;
  maxPrice: number;
  batteryMin: number | null;
  batteryMax: number | null;
  bestGrade: string;
  bestBatteryHealth: number | null;
  hasWarrantyOffer: boolean;
}

export function useFamilies(): UseQueryResult<FamilySummary[], Error> {
  return useQuery<FamilySummary[], Error>({
    queryKey: ['families'],
    queryFn: async ({ signal }) => {
      const { data } = await apiClient.get<{ items: FamilySummary[] }>(
        `/catalog/browse`,
        { params: { limit: 200 }, signal },
      );
      return data.items;
    },
    staleTime: 60_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/** Bir ailenin tüm varyant + teklif detayı: "tüm iPhone 12'ler" sayfası. */
export function useProductFamily(
  brand: string | null,
  model: string | null,
  filters: { sort?: ComparisonSort; storage?: string; grade?: string } = {},
): UseQueryResult<FamilyDetail | null, Error> {
  return useQuery<FamilyDetail | null, Error>({
    queryKey: ['product-family', brand, model, filters],
    queryFn: async ({ signal }) => {
      if (!brand || !model) return null;
      const { data } = await apiClient.get<FamilyDetail>(`/catalog/family`, {
        params: { brand, model, ...filters },
        signal,
      });
      return data;
    },
    enabled: !!brand && !!model,
    staleTime: 30_000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
