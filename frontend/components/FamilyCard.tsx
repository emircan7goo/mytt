'use client';
import Link from 'next/link';
import { Battery, ShieldCheck, Smartphone, Layers } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import type { FamilySummary } from '@/lib/hooks/useProducts';

const GRADE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'A+': { label: 'Kusursuz',         color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  'A':  { label: 'Çok İyi',          color: '#0369A1', bg: '#EFF6FF', border: '#BAE6FD' },
  'B':  { label: 'İyi',              color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'C':  { label: 'Kabul Edilebilir', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
};

const BRAND_SURFACE: Record<string, string> = {
  Apple: '#f5f5f7', Samsung: '#f0f2ff', Xiaomi: '#fff4ef', Redmi: '#fff1f1',
  POCO: '#fffcf0', Huawei: '#fff0f0', Vivo: '#f3f0ff', Realme: '#fff3ee',
  Tecno: '#f0fdf9', Infinix: '#f0fdf4', default: '#f8f9fb',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

interface Props {
  family: FamilySummary;
  index: number;
}

export default function FamilyCard({ family, index }: Props) {
  const gradeCfg = GRADE[family.bestGrade] ?? null;
  const surface  = BRAND_SURFACE[family.brand] ?? BRAND_SURFACE.default;
  const imgSrc   = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
  const isRange  = family.minPrice !== family.maxPrice;
  const href     = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

  return (
    <div className="group h-full" style={{ animationDelay: `${Math.min(index * 35, 200)}ms` }}>
      <Link href={href} className="block h-full">
        <div className="h-full flex flex-col bg-white rounded-[26px] border border-zinc-100 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(0,0,0,0.10)] hover:border-zinc-200">

          {/* ── Görsel ─────────────────────────────────────────────────── */}
          <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '3 / 4', background: surface }}>
            {gradeCfg && (
              <div
                className="absolute top-3 left-3 z-10 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ color: gradeCfg.color, background: gradeCfg.bg, border: `1px solid ${gradeCfg.border}` }}
              >
                <ShieldCheck size={9} /> En İyisi {family.bestGrade}
              </div>
            )}

            {family.offerCount > 1 && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-zinc-900/85 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                {family.offerCount} Teklif
              </div>
            )}

            {imgSrc ? (
              <img
                src={imgSrc}
                alt={`${family.brand} ${family.model}`}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.06]"
                style={{ padding: '10% 8%' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 select-none">
                <Smartphone size={48} className="opacity-[0.12] text-zinc-400" strokeWidth={1.5} />
                <div className="text-center px-4">
                  <p className="text-[11px] font-bold text-zinc-400">{family.brand}</p>
                  <p className="text-[10px] text-zinc-300 mt-0.5 line-clamp-2">{family.model}</p>
                </div>
              </div>
            )}

            {family.batteryMax !== null && (
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 bg-white/85 backdrop-blur-sm border border-white/60 rounded-full px-2 py-0.5 text-[10px] font-bold text-zinc-600 shadow-sm">
                <Battery size={10} className="text-emerald-500" />
                {family.batteryMin === family.batteryMax ? `%${family.batteryMax}` : `%${family.batteryMin}–${family.batteryMax}`}
              </div>
            )}
          </div>

          {/* ── Bilgi ──────────────────────────────────────────────────── */}
          <div className="flex flex-col flex-1 p-4 gap-1.5">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
              {family.brand}
            </span>
            <h3 className="font-editorial text-[19px] text-zinc-900 leading-snug line-clamp-2">
              {family.model}
            </h3>

            {family.storageOptions.length > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-full">
                  <Layers size={8} />
                  {family.storageOptions.length > 1
                    ? `${family.storageOptions[0]}–${family.storageOptions[family.storageOptions.length - 1]}`
                    : family.storageOptions[0]}
                </span>
                {family.hasWarrantyOffer && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-100">
                    Garantili Seçenek
                  </span>
                )}
              </div>
            )}

            <div className="flex-1" />

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-100">
              <div>
                <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide mb-0.5">
                  {isRange ? "'den başlayan fiyatlarla" : 'Net Fiyat'}
                </span>
                <span className="font-editorial text-[19px] text-zinc-900 leading-none">
                  {fmt(family.minPrice)}
                </span>
              </div>
              <div className="h-9 px-3.5 flex items-center rounded-xl text-[11px] font-black bg-zinc-900 text-white transition-all duration-200 group-hover:bg-emerald-600 group-hover:px-4">
                {family.offerCount > 1 ? 'Karşılaştır →' : 'İncele →'}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function FamilyCardSkeleton() {
  return (
    <div className="bg-white rounded-[26px] border border-zinc-100 overflow-hidden">
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
