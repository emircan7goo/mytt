'use client';
import Link from 'next/link';
import { Battery, Smartphone, ArrowUpRight, ShieldCheck, Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { useApp } from '@/providers/AppProvider';
import { familyToFavorite, familyFavoriteId } from '@/lib/familyFavorite';
import type { FamilySummary } from '@/lib/hooks/useProducts';
import DeviceRenderMockup from './DeviceRenderMockup';
import { getBrandLogo } from '@/lib/brandLogos';

const GRADE: Record<string, { label: string; hot?: boolean }> = {
  'A+': { label: 'Kusursuz', hot: true },
  'A':  { label: 'Çok İyi' },
  'B':  { label: 'İyi' },
  'C':  { label: 'Kabul Edilebilir' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

interface Props {
  family: FamilySummary;
  index: number;
}

export default function FamilyCard({ family, index }: Props) {
  const { toggleWishlist, isInWishlist } = useApp();
  const gradeCfg = GRADE[family.bestGrade] ?? null;
  const imgSrc   = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
  const isRange  = family.minPrice !== family.maxPrice;
  const href     = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;
  const fav      = isInWishlist(familyFavoriteId(family.brand, family.model));

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(familyToFavorite(family));
    toast.success(fav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', { duration: 2000 });
  };

  return (
    <Link
      href={href}
      className="group relative flex flex-col h-full rounded-2xl bg-[#161922] border border-slate-800/80 p-4 shadow-lg hover:shadow-2xl hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* ── Üst Rozetler & Favori ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1">
          <ShieldCheck size={12} className="text-orange-400" />
          {family.hasWarrantyOffer ? '12 AY GARANTİLİ' : 'DOĞRULANMIŞ STOK'}
        </span>

        <button
          onClick={handleFav}
          className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-slate-800 transition-colors shadow-xs"
          title={fav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          aria-pressed={fav}
        >
          <Heart size={15} className={fav ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </div>

      {/* ── Ürün Görseli veya 3D Vektör Mockup ─────────────────────────────── */}
      <div className="relative w-full aspect-square bg-[#0F1117]/80 border border-slate-800/60 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3 group-hover:border-orange-500/30 transition-colors">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${family.brand} ${family.model}`}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
          />
        ) : (
          <DeviceRenderMockup brand={family.brand} model={family.model} />
        )}

        {/* Çoklu teklif / Cihaz sayısı rozeti */}
        <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#161922]/95 border border-slate-700/80 text-white font-extrabold text-[11px] shadow-md flex items-center gap-1.5 backdrop-blur-md">
          <ShoppingBag size={12} className="text-orange-400" />
          <span>{family.offerCount} {family.offerCount > 1 ? 'Cihaz Seçeneği' : 'Adet Stokta'}</span>
        </span>
      </div>

      {/* ── Marka, Model & Değerlendirme ───────────────────────────────── */}
      <div className="flex flex-col flex-1 text-left space-y-1.5">
        <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-slate-400 font-normal text-[10px]">(120+ değerlendirme)</span>
        </div>

        {/* Marka İsmi ve Logosu */}
        <div className="flex items-center gap-1.5 text-[11px] font-black text-orange-400/90 uppercase tracking-wider">
          {getBrandLogo(family.brand, 13, "text-orange-400")}
          <span>{family.brand}</span>
        </div>

        <h3 className="font-extrabold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors">
          {family.model}
        </h3>

        {/* Depolama etiketleri */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {family.storageOptions.map((st) => (
            <span key={st} className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 font-bold text-[10px] border border-slate-700/50">
              {st}
            </span>
          ))}
          {family.colorOptions.slice(0, 2).map((cl) => (
            <span key={cl} className="px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-400 text-[10px] border border-slate-800">
              {cl}
            </span>
          ))}
        </div>
      </div>

      {/* ── Fiyatlandırma & İncele Butonu ────────────────────────────────── */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="text-left">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {isRange ? 'Fiyat Aralığı' : 'Fiyat'}
          </div>
          <div className="text-base font-black text-orange-400 leading-tight">
            {isRange ? (
              <span>{fmt(family.minPrice)} ₺ - {fmt(family.maxPrice)} ₺</span>
            ) : (
              <span>{fmt(family.minPrice)} ₺</span>
            )}
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1 shrink-0">
          <span>Tümünü Gör</span>
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}

export function FamilyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-[#161922] border border-slate-800 p-4 animate-pulse space-y-3">
      <div className="h-4 bg-slate-800 rounded w-1/3" />
      <div className="aspect-square bg-slate-800 rounded-xl" />
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="h-4 bg-slate-800 rounded w-1/2" />
      <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
        <div className="h-6 bg-slate-800 rounded w-1/2" />
        <div className="h-8 bg-slate-800 rounded w-1/4" />
      </div>
    </div>
  );
}
