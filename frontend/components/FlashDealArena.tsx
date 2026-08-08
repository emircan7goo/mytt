'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { FamilySummary } from '@/lib/hooks/useProducts';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { useApp } from '@/providers/AppProvider';
import { familyToFavorite, familyFavoriteId } from '@/lib/familyFavorite';
import { getProductPhotoUrl } from '@/lib/productImageMapper';

interface Props {
  products: FamilySummary[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

export default function FlashDealArena({ products }: Props) {
  const { toggleWishlist, isInWishlist } = useApp();
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 14, seconds: 22 });

  const handleFav = (family: FamilySummary) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasFav = isInWishlist(familyFavoriteId(family.brand, family.model));
    toggleWishlist(familyToFavorite(family));
    toast.success(wasFav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', { duration: 2000 });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 3, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => String(n).padStart(2, '0');

  if (!products || products.length === 0) return null;

  const dealProducts = products.slice(0, 4);

  return (
    <div className="w-full my-4 sm:my-8 max-w-full overflow-hidden">
      <div className="k-on-dark rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[var(--k-void)] via-[var(--k-canvas)] p-4 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-[var(--k-hot-deep)]/40">
        
        {/* ── Üst Başlık & Geri Sayım Sayacı ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[var(--k-line)]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[var(--k-hot-deep)] text-white flex items-center justify-center shadow-lg shrink-0">
              <Flame size={22} className="fill-white" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black text-[var(--k-hot)] tracking-wider uppercase">GÜNÜN FLAŞ FIRSATLARI</span>
              <h3 className="text-lg sm:text-3xl font-black text-white leading-tight">
                Seçili Cihazlarda Ek İndirim!
              </h3>
            </div>
          </div>

          {/* Geri Sayım Kutusui */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[var(--k-canvas)]/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-[var(--k-line)]">
            <Clock size={14} className="text-[var(--k-hot)] sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold text-[var(--k-ink-4)]">Kalan Süre:</span>
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-base text-[var(--k-hot)]">
              <span className="bg-[var(--k-void)] px-1.5 py-0.5 rounded border border-[var(--k-line)]">{format(timeLeft.hours)}</span>:
              <span className="bg-[var(--k-void)] px-1.5 py-0.5 rounded border border-[var(--k-line)]">{format(timeLeft.minutes)}</span>:
              <span className="bg-[var(--k-void)] px-1.5 py-0.5 rounded border border-[var(--k-line)]">{format(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        {/* ── MOBİL 2'Lİ FLAŞ ÜRÜN KARTLARI IZGARASI ── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {dealProducts.map((family, idx) => {
            const imgSrc = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
            const oldPrice = Math.round(family.minPrice * 1.18);
            const href = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;
            const soldPercent = 75 + idx * 6;

            return (
              <Link
                key={family.model}
                href={href}
                className="group flex flex-col justify-between bg-[var(--k-void)] text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[var(--k-line)] shadow-md hover:border-[var(--k-hot-deep)] transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--k-hot-deep)]/20 text-[var(--k-hot)] font-black text-[8px] sm:text-[9px] uppercase border border-[var(--k-hot-deep)]/30 truncate">
                      %15 İNDİRİM
                    </span>
                    <button
                      onClick={handleFav(family)}
                      title={isInWishlist(familyFavoriteId(family.brand, family.model)) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                      aria-pressed={isInWishlist(familyFavoriteId(family.brand, family.model))}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[var(--k-canvas)] border border-[var(--k-line)] flex items-center justify-center text-[var(--k-ink-4)] hover:text-[var(--k-hot)] transition-colors"
                    >
                      <Heart size={12} className={`sm:w-3.5 sm:h-3.5 ${isInWishlist(familyFavoriteId(family.brand, family.model)) ? 'fill-[var(--k-hot)] text-[var(--k-hot)]' : ''}`} />
                    </button>
                  </div>

                  <div className="w-full aspect-square bg-[var(--k-canvas)] rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-center overflow-hidden mb-2 sm:mb-3">
                    <img
                      src={getProductPhotoUrl(family.brand, family.model, imgSrc)}
                      alt={family.model}
                      className="h-full w-full object-contain group-hover:scale-108 transition-transform duration-500"
                    />
                  </div>

                  <div className="text-left space-y-0.5">
                    <div className="text-[11px] sm:text-xs font-black text-white line-clamp-1">{family.brand} {family.model}</div>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-orange-400">
                      <span>✓ Doğrulanmış Stok</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 mt-2 border-t border-[var(--k-line)] space-y-1.5">
                  {/* Stok Çubuğu */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-[var(--k-ink-4)]">
                      <span>Stok</span>
                      <span className="text-[var(--k-hot)] font-extrabold">%{soldPercent}</span>
                    </div>
                    <div className="w-full h-1 bg-[var(--k-canvas)] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--k-hot)] to-[var(--k-hot)] rounded-full" style={{ width: `${soldPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-1">
                    <div className="text-left">
                      <div className="text-[9px] sm:text-[10px] text-[var(--k-ink-4)] line-through font-bold">{fmt(oldPrice)} ₺</div>
                      <div className="text-xs sm:text-base font-black text-[var(--k-hot)] leading-none">{fmt(family.minPrice)} ₺</div>
                    </div>
                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[var(--k-hot-deep)] text-white font-extrabold text-[10px] sm:text-xs shadow-xs">
                      İncele
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
