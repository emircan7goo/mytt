'use client';
import Link from 'next/link';
import { ShieldCheck, Heart, ShoppingCart, Truck, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { useApp } from '@/providers/AppProvider';
import { familyToFavorite, familyFavoriteId } from '@/lib/familyFavorite';
import type { FamilySummary } from '@/lib/hooks/useProducts';
import { getProductPhotoUrl } from '@/lib/productImageMapper';

const GRADE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  'A+': { label: 'Mükemmel', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/60', icon: Sparkles },
  'A':  { label: 'Çok İyi', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/60', icon: UserCheck },
  'B':  { label: 'İyi', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/60', icon: CheckCircle2 },
  'C':  { label: 'Kabul Edilebilir', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/60', icon: CheckCircle2 },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

const fmtDec = (n: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

interface Props {
  family: FamilySummary;
  index: number;
}

export default function FamilyCard({ family, index }: Props) {
  const { toggleWishlist, isInWishlist, addToCart } = useApp();
  const gradeCfg = GRADE_CONFIG[family.bestGrade] ?? GRADE_CONFIG['A'];
  const GradeIcon = gradeCfg.icon;

  const rawImg = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
  const photoUrl = getProductPhotoUrl(family.brand, family.model, rawImg);

  const isRange  = family.minPrice !== family.maxPrice;
  const href     = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;
  const fav      = isInWishlist(familyFavoriteId(family.brand, family.model));

  const storageStr = family.storageOptions.length > 0 ? family.storageOptions.join(' / ') : '';
  const colorStr   = family.colorOptions.length > 0 ? family.colorOptions[0] : '';

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(familyToFavorite(family));
    toast.success(fav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', { duration: 2000 });
  };

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
      className="group relative flex flex-col h-full rounded-2xl bg-white dark:bg-[#161922] border border-slate-200 dark:border-slate-800/90 p-4 shadow-sm hover:shadow-xl hover:border-orange-500/40 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
    >
      {/* ── 1. Üst Rozet: Kozmetik Durum (Getmobil Tarzı Sol Üst) & Favori ────── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${gradeCfg.bg} ${gradeCfg.text} ${gradeCfg.border}`}>
          <GradeIcon size={13} strokeWidth={2.2} />
          <span>{gradeCfg.label}</span>
        </div>

        <button
          onClick={handleFav}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          aria-pressed={fav}
        >
          <Heart size={15} className={fav ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* ── 2. Ürün Görseli & Hızlı Kargo Rozeti ───────────────────────────── */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square bg-slate-50 dark:bg-[#0D0F17] rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3.5 group-hover:bg-slate-100 dark:group-hover:bg-[#121520] transition-colors">
        <img
          src={photoUrl}
          alt={`${family.brand} ${family.model}`}
          loading="lazy"
          className="h-full w-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hızlı Kargo Rozeti (Fotoğrafın sol altı) */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-[10px] tracking-wide uppercase flex items-center gap-1 shadow-md">
          <Truck size={12} strokeWidth={2.5} />
          <span>HIZLI KARGO</span>
        </div>

        {/* Çoklu Teklif Rozeti (Sağ alt) */}
        {family.offerCount > 1 && (
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-extrabold text-[10px] shadow-md border border-slate-700">
            {family.offerCount} TEKLİF
          </div>
        )}
      </div>

      {/* ── 3. Satıcı Güvence Satırı ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 size={11} strokeWidth={3} />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">
          Mytt Güvencesi
        </span>
      </div>

      {/* ── 4. Ürün Başlığı & Detayı ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 text-left space-y-1 mb-3">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-500 transition-colors">
          <span className="font-black text-orange-600 dark:text-orange-400 mr-1">İkinci El</span>
          {family.brand} {family.model}
        </h3>

        {(storageStr || colorStr) && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {[storageStr, colorStr].filter(Boolean).join(' ')}
          </p>
        )}
      </div>

      {/* ── 5. Fiyat, Taksit & Sepete Ekle Butonu ──────────────────────────── */}
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
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
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
