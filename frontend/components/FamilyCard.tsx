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

  const storageStr = family.storageOptions.length > 0 ? family.storageOptions.join(' / ') : '';
  const colorStr   = family.colorOptions.length > 0 ? family.colorOptions[0] : '';

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${family.brand}-${family.model}`,
      brand: family.brand,
      model: family.model,
      price: family.minPrice,
      originalPrice: family.maxPrice,
      storage: storageStr || '128GB',
      color: colorStr || 'Siyah',
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
      className="group relative flex flex-col h-full rounded-2xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-slate-800/90 p-4 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
    >
      {/* ── 1. Temiz Dikey Ürün Görseli Kutusu (Aspect 3/4 Telefon Formatı) ────── */}
      <div className="relative w-full aspect-[3/4] bg-slate-50 dark:bg-[#0D0F17] rounded-xl p-2.5 sm:p-3 flex items-center justify-center overflow-hidden mb-3 group-hover:bg-slate-100 dark:group-hover:bg-[#121520] transition-colors">
        <img
          src={photoUrl}
          alt={`${family.brand} ${family.model}`}
          loading="lazy"
          className="h-full w-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* ── 2. Ürün Başlığı & Detayı ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 text-left space-y-1 mb-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
          <span className="font-black text-orange-600 dark:text-orange-400 mr-1">{family.brand}</span>
          {family.model}
        </h3>

        {(storageStr || colorStr) && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {[storageStr, colorStr].filter(Boolean).join(' ')}
          </p>
        )}
      </div>

      {/* ── 3. Fiyat, Taksit & Sepete Ekle Butonu ──────────────────────────── */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-2">
        <div className="text-left space-y-1">
          {/* Fiyat */}
          <div className="text-lg font-black text-slate-900 dark:text-white leading-none">
            {isRange ? (
              <span>₺{fmt(family.minPrice)} - ₺{fmt(family.maxPrice)}</span>
            ) : (
              <span>₺{fmt(family.minPrice)}</span>
            )}
          </div>

          {/* 12 Taksit Rozeti */}
          <div className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800/50">
            12 x ₺{fmtDec(monthlyPrice)}
          </div>
        </div>

        {/* Sepet Butonu (Turuncu Kare) */}
        <button
          onClick={handleCart}
          className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-orange-500/25 transition-all shrink-0"
          title="Sepete Ekle"
        >
          <ShoppingCart size={18} strokeWidth={2.2} />
        </button>
      </div>
    </Link>
  );
}

export function FamilyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-slate-800 p-4 animate-pulse space-y-3">
      <div className="aspect-square bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
