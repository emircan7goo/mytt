'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { Star, Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import type { FamilySummary } from '@/lib/hooks/useProducts';
import { resolveUploadUrl } from '@/lib/resolveUrl';

interface Props {
  products: FamilySummary[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

export default function TrendyolSpecialProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full my-6 max-w-full overflow-hidden">
      <div className="bg-[#0F172A] rounded-3xl p-6 md:p-8 relative group border border-slate-800 shadow-2xl">

        {/* ── Üst Başlık & Tümünü Gör ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Sana Özel Ürünler
          </h2>
          <Link
            href="/"
            className="text-xs font-black text-slate-300 hover:text-orange-400 flex items-center gap-1 transition-colors"
          >
            <span>Tümünü Gör</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Sol Kaydırma Butonu */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-2xl border border-slate-700 flex items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={20} />
        </button>

        {/* ── Lüks Koyu Temalı Ürün Kartları Kaydırma Arenası ── */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex items-stretch gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {products.slice(0, 10).map((family) => {
            const imgSrc = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
            const oldPrice = Math.round(family.minPrice * 1.15);
            const href = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

            return (
              <Link
                key={`${family.brand}-${family.model}`}
                href={href}
                className="group/card flex flex-col justify-between shrink-0 w-[220px] bg-slate-950 rounded-2xl border border-slate-800/90 p-3.5 shadow-xl hover:shadow-2xl hover:border-orange-500 transition-all duration-300 relative overflow-hidden"
              >
                {/* ── Üst Etiketler & Favori Kalp ── */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded bg-orange-600/20 text-orange-400 border border-orange-500/30 font-extrabold text-[9px] uppercase tracking-wider">
                      Kargo Bedava
                    </span>

                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:bg-slate-800 transition-colors"
                      title="Favorilere Ekle"
                    >
                      <Heart size={14} />
                    </button>
                  </div>

                  {/* ── Ürün Görseli ── */}
                  <div className="w-full aspect-square bg-slate-900/90 rounded-xl p-3 flex items-center justify-center overflow-hidden border border-slate-800/60 group-hover/card:bg-slate-900 transition-colors">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={`${family.brand} ${family.model}`}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-500 group-hover/card:scale-108"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs font-bold">{family.brand}</div>
                    )}
                  </div>

                  {/* ── Marka & Model Başlığı ── */}
                  <div className="text-left space-y-1 pt-1">
                    <div className="text-[12px] font-black text-white line-clamp-2 leading-snug">
                      <span className="font-black text-orange-400 mr-1">{family.brand}</span>
                      <span className="font-bold text-slate-200">{family.model}</span>
                    </div>

                    {/* Yıldız Değerlendirmesi */}
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400 pt-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span>4.9</span>
                      <span className="text-slate-400 text-[10px] font-medium">(2051)</span>
                    </div>
                  </div>
                </div>

                {/* ── Fiyatlandırma (Lüks Koyu Tema Stili) ── */}
                <div className="pt-3 mt-2 border-t border-slate-800 text-left">
                  <div className="text-[11px] font-bold text-slate-400 line-through leading-none">
                    {fmt(oldPrice)} TL
                  </div>
                  <div className="text-base font-black text-orange-400 leading-tight mt-0.5">
                    {fmt(family.minPrice)} TL
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Butonu */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-2xl border border-slate-700 flex items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={20} />
        </button>

      </div>
    </div>
  );
}
