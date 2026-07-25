'use client';
/**
 * DealerStockCard — Vitrin Ürün Kartı
 *
 * Görsel politikası:
 *  - Kart/vitrin: daima globalProduct.masterImages[0] — admin'in yüklediği
 *    temiz, arka plansız PNG. Bayi fotoğrafları burada gösterilmez.
 *  - Detay sayfası: dealerImages (gerçek durum fotoğrafları)
 *
 * Tasarım kararları:
 *  - Dikey (portrait 3:4) format — telefon görselleri için ideal
 *  - object-contain — şeffaf PNG arka planı bozulmaz
 *  - Marka'ya özel subtil arka plan tonu
 *  - Grade rozeti sol üst, pil sağ alt
 */
import { useState } from 'react';
import Link from 'next/link';
import { Battery, Box, Heart, ShieldCheck, Smartphone } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import type { ApiProduct } from '@/lib/hooks/useProducts';
import { useWishlistIds, useWishlistToggle } from '@/lib/hooks/useWishlist';
import { toast } from 'sonner';

// ── Grade konfigürasyonu ──────────────────────────────────────────────────────
const GRADE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'A+': { label: 'Kusursuz', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  'A':  { label: 'Çok İyi',  color: '#0284c7', bg: '#eff6ff', border: '#bae6fd' },
  'B':  { label: 'İyi',      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  'C':  { label: 'Kabul Edilebilir', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
};

// ── Marka görseli için arka plan ──────────────────────────────────────────────
const BRAND_SURFACE: Record<string, string> = {
  Apple:   '#f5f5f7',
  Samsung: '#f0f2ff',
  Xiaomi:  '#fff4ef',
  Redmi:   '#fff1f1',
  POCO:    '#fffcf0',
  Huawei:  '#fff0f0',
  Vivo:    '#f3f0ff',
  Realme:  '#fff3ee',
  Tecno:   '#f0fdf9',
  Infinix: '#f0fdf4',
  default: '#f8f9fb',
};

// ── Para formatı ──────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY', maximumFractionDigits: 0,
  }).format(n);

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  product: ApiProduct;
  index:   number;
}

export default function DealerStockCard({ product, index }: Props) {
  const [imgError, setImgError] = useState(false);
  const { data: wishlistIds }   = useWishlistIds();
  const { toggle, isAuthenticated } = useWishlistToggle();
  const isWishlisted = wishlistIds?.includes(product.id) ?? false;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Favori eklemek için giriş yapmalısınız');
      return;
    }
    await toggle(product.id, isWishlisted);
    toast.success(isWishlisted ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  };

  const grade    = product.grade ?? (product.specsJson?.cosmeticGrade as string) ?? null;
  const battery  = product.batteryHealth ?? (product.specsJson?.batteryHealth as number) ?? null;
  const gradeCfg = grade ? (GRADE[grade] ?? null) : null;
  const surface  = BRAND_SURFACE[product.brand] ?? BRAND_SURFACE.default;

  // Vitrin görseli — masterImage (temiz katalog PNG)
  const imgSrc = product.masterImage
    ? resolveUploadUrl(product.masterImage)
    : null;

  const hasImg = !!imgSrc && !imgError;

  // Aynı model birden fazla bayide varsa, tekil teklif yerine
  // anonim karşılaştırma sayfasına yönlendir.
  const hasMultipleOffers = (product.offerCount ?? 1) > 1;
  const href = hasMultipleOffers && product.globalProductId
    ? `/urun/${product.globalProductId}`
    : `/product/${product.id}`;

  return (
    <div
      className="group h-full"
      style={{ animationDelay: `${Math.min(index * 35, 200)}ms` }}
    >
      <Link href={href} className="block h-full">
        <div className="h-full flex flex-col bg-white rounded-2xl border border-zinc-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:border-zinc-200">

          {/* ── Görsel Alan (portrait 3:4) ─────────────────────────────────── */}
          <div
            className="relative overflow-hidden flex-shrink-0"
            style={{ aspectRatio: '3 / 4', background: surface }}
          >
            {/* Grade rozeti */}
            {gradeCfg && (
              <div
                className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{
                  color: gradeCfg.color,
                  background: gradeCfg.bg,
                  border: `1px solid ${gradeCfg.border}`,
                }}
              >
                <ShieldCheck size={9} />
                {grade} · {gradeCfg.label}
              </div>
            )}

            {/* Pil sağlığı */}
            {battery !== null && battery !== undefined && (
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-white/60 rounded-full px-2 py-0.5 text-[10px] font-bold text-zinc-600 shadow-sm">
                <Battery
                  size={10}
                  className={battery >= 85 ? 'text-orange-500' : battery >= 70 ? 'text-amber-500' : 'text-red-400'}
                />
                %{battery}
              </div>
            )}

            {/* Ürün görseli */}
            {hasImg ? (
              <img
                src={imgSrc!}
                alt={`${product.brand} ${product.model}`}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                style={{
                  padding: '10% 8%',
                  imageRendering: 'auto',
                }}
              />
            ) : (
              /* Görsel yoksa marka placeholder */
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 select-none">
                <Smartphone size={48} className="opacity-[0.12] text-zinc-400" strokeWidth={1.5} />
                <div className="text-center px-4">
                  <p className="text-[11px] font-bold text-zinc-400">{product.brand}</p>
                  <p className="text-[10px] text-zinc-300 mt-0.5 line-clamp-2">{product.model}</p>
                </div>
              </div>
            )}

            {/* Favori (kalp) butonu */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm transition-all duration-200 hover:scale-110 hover:bg-white"
              aria-label={isWishlisted ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              <Heart size={14} className={isWishlisted ? 'text-red-500 fill-red-500' : 'text-zinc-400'} />
            </button>

            {/* Stok uyarısı */}
            {product.stock <= 2 && product.stock > 0 && (
              <div className="absolute top-10 right-3 z-10 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                Son {product.stock}!
              </div>
            )}

            {/* Çoklu teklif rozeti */}
            {hasMultipleOffers && (
              <div className="absolute bottom-3 left-3 z-10 bg-zinc-900/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                {product.offerCount} Teklif
              </div>
            )}
          </div>

          {/* ── Bilgi Alanı ───────────────────────────────────────────────── */}
          <div className="flex flex-col flex-1 p-4 gap-1.5">

            {/* Marka · Depolama */}
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
              {product.brand}{product.storage ? ` · ${product.storage}` : ''}
            </span>

            {/* Model adı */}
            <h3 className="text-[14px] font-bold text-zinc-900 leading-snug line-clamp-2">
              {product.model}
            </h3>

            {/* Aksesuarlar satırı */}
            {(product.hasBox || product.warrantyMonths) && (
              <div className="flex items-center gap-2 mt-0.5">
                {product.hasBox && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-full">
                    <Box size={8} /> Kutu
                  </span>
                )}
                {product.warrantyMonths && product.warrantyMonths > 0 && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-100">
                    <ShieldCheck size={8} /> {product.warrantyMonths}ay
                  </span>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Fiyat + CTA */}
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-100">
              <div>
                {hasMultipleOffers && (
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-0.5">
                    örnek teklif
                  </span>
                )}
                <span className="text-[17px] font-black text-zinc-900 leading-none">
                  {fmt(product.price)}
                </span>
              </div>
              <div className="h-9 px-3.5 flex items-center rounded-xl text-[11px] font-black bg-zinc-900 text-white transition-all duration-200 group-hover:bg-black group-hover:px-4">
                {hasMultipleOffers ? 'Karşılaştır →' : 'İncele →'}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function DealerStockCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      {/* Portrait image area */}
      <div className="skeleton-wave" style={{ aspectRatio: '3 / 4' }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-2.5 w-16 skeleton-wave rounded-full" />
        <div className="h-4 w-3/4 skeleton-wave rounded-full" />
        <div className="h-3 w-1/2 skeleton-wave rounded-full" />
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
          <div className="h-5 w-20 skeleton-wave rounded-full" />
          <div className="h-9 w-20 skeleton-wave rounded-xl" />
        </div>
      </div>
    </div>
  );
}
