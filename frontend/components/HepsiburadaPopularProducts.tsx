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

export default function HepsiburadaPopularProducts({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full my-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm relative group">

        {/* ── Üst Başlık ── */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Popüler ürünlerden seçtik
          </h2>
          <Link
            href="/"
            className="text-xs font-black text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors"
          >
            <span>Tümünü Gör</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Sol Kaydırma Butonu */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={20} />
        </button>

        {/* ── Ürün Kartları Kulvarı ── */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex items-stretch gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {products.map((family, idx) => {
            const imgSrc = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
            const installment = Math.round(family.minPrice / 3);
            const href = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

            return (
              <Link
                key={`${family.brand}-${family.model}`}
                href={href}
                className="group/card flex flex-col justify-between shrink-0 w-[220px] bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs hover:shadow-xl hover:border-orange-400 transition-all duration-300 relative overflow-hidden"
              >
                {/* ── Favori Kalp ── */}
                <div className="flex justify-end mb-1">
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    title="Favorilere Ekle"
                  >
                    <Heart size={14} />
                  </button>
                </div>

                {/* ── Görsel ── */}
                <div className="w-full aspect-square bg-slate-50/80 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3 group-hover/card:bg-orange-50/30 transition-colors">
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

                {/* ── Detaylar ── */}
                <div className="text-left space-y-1.5 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover/card:text-orange-600 transition-colors">
                    {family.brand} {family.model}
                  </h3>

                  {/* Yıldız Değerlendirmesi */}
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-orange-500">
                    <Star size={12} className="fill-orange-400 text-orange-400" />
                    <span>4.6</span>
                    <span className="text-slate-400 text-[10px] font-medium">(1004)</span>
                  </div>
                </div>

                {/* ── Taksit / Fırsat Etiketi (Birebir Hepsiburada Rozeti) ── */}
                <div className="pt-3 mt-2 border-t border-slate-100 space-y-1.5 text-left">
                  <div className="text-sm font-black text-orange-600">
                    {fmt(family.minPrice)} ₺
                  </div>
                  <div className="inline-block px-2 py-0.5 rounded bg-purple-700 text-white font-extrabold text-[9.5px]">
                    HepsiTaksit ile 3 x {fmt(installment)} ₺
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Butonu */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={20} />
        </button>

      </div>
    </div>
  );
}
