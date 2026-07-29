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
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="w-full my-4 sm:my-6 max-w-full overflow-hidden">
      <div className="bg-[var(--k-canvas)] rounded-2xl sm:rounded-3xl p-4 sm:p-8 relative group border border-[var(--k-line)] shadow-2xl">

        {/* ── Üst Başlık & Tümünü Gör ── */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            Sana Özel Ürünler
          </h2>
          <Link
            href="/"
            className="text-[11px] sm:text-xs font-black text-[var(--k-ink-4)] hover:text-[var(--k-hot)] flex items-center gap-1 transition-colors"
          >
            <span>Tümünü Gör</span>
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
          </Link>
        </div>

        {/* Sol Kaydırma Butonu */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--k-canvas)]/90 text-white shadow-2xl border border-[var(--k-line)] items-center justify-center hover:bg-[var(--k-hot-deep)] hover:border-[var(--k-hot-deep)] transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={20} />
        </button>

        {/* ── MOBİL YEREL UYGULAMA DÜZENİNDE SANA ÖZEL ÜRÜNLER (w-[155px]) ── */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex items-stretch gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-1 max-w-full"
        >
          {products.slice(0, 10).map((family) => {
            const imgSrc = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
            const oldPrice = Math.round(family.minPrice * 1.15);
            const href = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

            return (
              <Link
                key={`${family.brand}-${family.model}`}
                href={href}
                className="group/card flex flex-col justify-between shrink-0 w-[155px] sm:w-[220px] bg-[var(--k-void)] rounded-xl sm:rounded-2xl border border-[var(--k-line)]/90 p-2.5 sm:p-3.5 shadow-xl hover:shadow-2xl hover:border-[var(--k-hot-deep)] transition-all duration-300 relative overflow-hidden select-none"
              >
                {/* ── Üst Etiketler & Favori Kalp ── */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--k-hot-deep)]/20 text-[var(--k-hot)] border border-[var(--k-hot-deep)]/30 font-black text-[8px] sm:text-[9px] uppercase tracking-wider">
                      Kargo Bedava
                    </span>

                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--k-canvas)] border border-[var(--k-line)] flex items-center justify-center text-[var(--k-ink-4)] hover:text-[var(--k-hot)] transition-colors"
                      title="Favorilere Ekle"
                    >
                      <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  {/* ── Ürün Görseli ── */}
                  <div className="w-full aspect-square bg-[var(--k-canvas)]/90 rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-center overflow-hidden border border-[var(--k-line)]/60 group-hover/card:bg-[var(--k-canvas)] transition-colors">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={`${family.brand} ${family.model}`}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-500 group-hover/card:scale-108"
                      />
                    ) : (
                      <div className="text-[var(--k-ink-4)] text-xs font-bold">{family.brand}</div>
                    )}
                  </div>

                  {/* ── Marka & Model Başlığı ── */}
                  <div className="text-left space-y-0.5 sm:space-y-1 pt-0.5">
                    <div className="text-[11px] sm:text-[12px] font-black text-white line-clamp-2 leading-snug">
                      <span className="font-black text-[var(--k-hot)] mr-1">{family.brand}</span>
                      <span className="font-bold text-[var(--k-ink-2)]">{family.model}</span>
                    </div>

                    {/* Yıldız Değerlendirmesi */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-[var(--k-hot)] pt-0.5">
                      <Star size={10} className="fill-[var(--k-hot)] text-[var(--k-hot)] sm:w-3 sm:h-3" />
                      <span>4.9</span>
                      <span className="text-[var(--k-ink-4)] text-[9px] sm:text-[10px] font-medium">(2051)</span>
                    </div>
                  </div>
                </div>

                {/* ── Fiyatlandırma ── */}
                <div className="pt-2 sm:pt-3 mt-1.5 border-t border-[var(--k-line)] text-left">
                  <div className="text-[10px] sm:text-[11px] font-bold text-[var(--k-ink-4)] line-through leading-none">
                    {fmt(oldPrice)} TL
                  </div>
                  <div className="text-sm sm:text-base font-black text-[var(--k-hot)] leading-tight mt-0.5">
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
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--k-canvas)]/90 text-white shadow-2xl border border-[var(--k-line)] items-center justify-center hover:bg-[var(--k-hot-deep)] hover:border-[var(--k-hot-deep)] transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={20} />
        </button>

      </div>
    </div>
  );
}
