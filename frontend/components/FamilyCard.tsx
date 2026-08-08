'use client';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { useApp } from '@/providers/AppProvider';
import type { FamilySummary } from '@/lib/hooks/useProducts';
import { getProductPhotoUrl } from '@/lib/productImageMapper';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

const fmtDec = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface Props {
  family: FamilySummary;
  index: number;
}

export default function FamilyCard({ family, index }: Props) {
  const { addToCart } = useApp();

  const rawImg = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
  const photoUrl = getProductPhotoUrl(family.brand, family.model, rawImg);

  const isRange  = family.minPrice !== family.maxPrice;
  const href     = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

  const rawStorage = family.storageOptions.length > 0 ? family.storageOptions.join(' / ') : '';
  const rawColor   = family.colorOptions.length > 0 ? family.colorOptions[0] : '';

  // 64 gbGB, 64GBGB -> 64GB temizliği
  const cleanStorage = rawStorage
    ? rawStorage.replace(/gbgb/gi, 'GB').replace(/gb/gi, 'GB').replace(/\s+GB/gi, 'GB').trim()
    : '';

  const specsSubtitle = [cleanStorage, rawColor].filter(Boolean).join(' • ');

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${family.brand}-${family.model}`,
      brand: family.brand,
      model: family.model,
      price: family.minPrice,
      originalPrice: family.maxPrice,
      storage: cleanStorage || '128GB',
      color: rawColor || 'Siyah',
      cosmeticGrade: family.bestGrade || 'A',
      batteryHealth: family.bestBatteryHealth ?? 85,
      warrantyMonths: family.hasWarrantyOffer ? 12 : 6,
      sellerName: 'Semih İletişim',
      sellerRating: 4.9,
      sellerBadges: ['TSE Yetkili Bayi'],
      storeId: family.storeIds[0] || '',
      image: photoUrl,
      images: [photoUrl],
      specs: {},
      stock: family.offerCount,
    } as any);
    toast.success(`${family.brand} ${family.model} sepete eklendi 🛒`, { duration: 2000 });
  };

  const monthlyPrice = family.minPrice / 12;

  return (
    <Link
      href={href}
      className="group relative flex flex-col h-full rounded-2xl bg-[#161922] border border-slate-800/90 p-3 sm:p-3.5 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
    >
      {/* ── 1. Doğrudan Temiz Görsel (İç Kutu / Koyu Arka Plan Yok) ───────── */}
      <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden mb-3">
        <img
          src={photoUrl}
          alt={`${family.brand} ${family.model}`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80';
          }}
          className="h-full w-full object-contain rounded-xl drop-shadow-md transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* ── 2. Ürün Başlığı & Detayı ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 text-left space-y-0.5 mb-2.5 min-w-0">
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-100 line-clamp-1 leading-snug group-hover:text-orange-500 transition-colors">
          <span className="font-black text-orange-400 mr-1">{family.brand}</span>
          {family.model}
        </h3>

        {specsSubtitle && (
          <p className="text-[11px] font-semibold text-slate-400 truncate">
            {specsSubtitle}
          </p>
        )}
      </div>

      {/* ── 3. Fiyat, Taksit & Sepete Ekle Butonu ──────────────────────────── */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-end justify-between gap-1">
        <div className="text-left min-w-0 flex-1">
          {/* Fiyat */}
          <div className="text-xs sm:text-sm font-black text-white leading-tight truncate">
            {isRange ? (
              <span>₺{fmt(family.minPrice)} - ₺{fmt(family.maxPrice)}</span>
            ) : (
              <span>₺{fmt(family.minPrice)}</span>
            )}
          </div>

          {/* 12 Taksit Rozeti */}
          <div className="inline-block px-1.5 py-0.5 mt-1 rounded bg-blue-950/60 text-blue-300 font-extrabold text-[9px] sm:text-[10px] border border-blue-800/50 truncate max-w-full">
            12 x ₺{fmtDec(monthlyPrice)}
          </div>
        </div>

        {/* Sepet Butonu */}
        <button
          onClick={handleCart}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-orange-500/25 transition-all shrink-0 ml-1"
          title="Sepete Ekle"
        >
          <ShoppingCart size={15} strokeWidth={2.2} />
        </button>
      </div>
    </Link>
  );
}

export function FamilyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#161922] border border-slate-800 p-3.5 animate-pulse space-y-3">
      <div className="aspect-square bg-slate-800/60 rounded-xl" />
      <div className="h-4 bg-slate-800 rounded w-1/2" />
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
        <div className="h-5 bg-slate-800 rounded w-1/2" />
        <div className="w-9 h-9 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
