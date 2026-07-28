'use client';
import Link from 'next/link';
import { Battery, Smartphone, ArrowUpRight, ShieldCheck, Heart, Star, ShoppingBag } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import type { FamilySummary } from '@/lib/hooks/useProducts';

const GRADE: Record<string, { label: string; hot?: boolean }> = {
  'A+': { label: 'Kusursuz', hot: true },
  'A':  { label: 'Çok İyi' },
  'B':  { label: 'İyi' },
  'C':  { label: 'İdare Eder' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

interface Props {
  family: FamilySummary;
  index: number;
}

export default function FamilyCard({ family, index }: Props) {
  const gradeCfg = GRADE[family.bestGrade] ?? null;
  const imgSrc   = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
  const isRange  = family.minPrice !== family.maxPrice;
  const href     = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col h-full rounded-2xl bg-white border border-orange-200/80 p-4 shadow-xs hover:shadow-[0_0_30px_rgba(255,96,0,0.3)] hover:border-orange-500 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* ── Üst Rozetler & Favori (Neon Turuncu) ───────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-[0_0_10px_rgba(255,96,0,0.4)]">
          {family.hasWarrantyOffer ? 'TSE 12 AY GARANTİ' : 'SEPETTE İNDİRİMLİ'}
        </span>

        <button
          onClick={(e) => { e.preventDefault(); }}
          className="w-8 h-8 rounded-full bg-orange-50/60 border border-orange-200 flex items-center justify-center text-orange-400 hover:text-orange-600 hover:bg-orange-100 hover:border-orange-400 transition-colors shadow-xs"
          title="Favorilere Ekle"
        >
          <Heart size={15} />
        </button>
      </div>

      {/* ── Ürün Görseli ─────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-orange-50/40 rounded-xl p-4 flex items-center justify-center overflow-hidden mb-3 group-hover:bg-orange-50/80 transition-colors">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${family.brand} ${family.model}`}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-orange-400 select-none">
            <Smartphone size={36} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase">{family.brand}</span>
          </div>
        )}

        {/* Çoklu teklif rozeti */}
        {family.offerCount > 1 && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/95 border border-orange-300 text-orange-800 font-extrabold text-[10px] shadow-xs">
            {family.offerCount} BAYİ TEKLİFİ
          </span>
        )}
      </div>

      {/* ── Marka, Model & Değerlendirme ───────────────────────────────── */}
      <div className="flex flex-col flex-1 text-left space-y-1.5">
        <div className="flex items-center gap-1 text-[11px] font-extrabold text-orange-500">
          <Star size={12} className="fill-orange-500 text-orange-500" />
          <span>4.9</span>
          <span className="text-slate-400 font-medium">(120+ değerlendirme)</span>
        </div>

        <div className="text-[11px] font-black text-orange-600/80 uppercase tracking-wider">
          {family.brand}
        </div>

        <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
          {family.model}
        </h3>

        {/* Depolama etiketleri */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {family.storageOptions.map((st) => (
            <span key={st} className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-900 font-bold text-[10px] border border-orange-200/80">
              {st}
            </span>
          ))}
        </div>
      </div>

      {/* ── Fiyatlandırma & Satın Al Butonu ──────────────────────────────── */}
      <div className="pt-3 mt-3 border-t border-orange-100 flex items-center justify-between gap-2">
        <div className="text-left">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase">
            {isRange ? 'Başlangıç Fiyatı' : 'Net Fiyat'}
          </div>
          <div className="text-lg font-black text-orange-600 leading-none drop-shadow-xs">
            {fmt(family.minPrice)} <span className="text-xs">₺</span>
          </div>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 group-hover:from-orange-600 group-hover:to-amber-700 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(255,96,0,0.4)] transition-all flex items-center gap-1">
          <span>İncele</span>
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </div>
      </div>
    </Link>
  );
}

export function FamilyCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-orange-100 p-4 animate-pulse space-y-3">
      <div className="h-4 bg-orange-50 rounded w-1/3" />
      <div className="aspect-square bg-orange-50 rounded-xl" />
      <div className="h-4 bg-orange-50 rounded w-3/4" />
      <div className="h-4 bg-orange-50 rounded w-1/2" />
      <div className="pt-3 border-t border-orange-100 flex justify-between items-center">
        <div className="h-6 bg-orange-50 rounded w-1/2" />
        <div className="h-8 bg-orange-50 rounded w-1/4" />
      </div>
    </div>
  );
}
