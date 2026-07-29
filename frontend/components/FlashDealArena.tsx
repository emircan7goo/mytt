'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, Heart, Star } from 'lucide-react';
import type { FamilySummary } from '@/lib/hooks/useProducts';
import { resolveUploadUrl } from '@/lib/resolveUrl';

interface Props {
  products: FamilySummary[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

export default function FlashDealArena({ products }: Props) {
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 14, seconds: 22 });

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
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 p-4 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-orange-500/40">
        
        {/* ── Üst Başlık & Geri Sayım Sayacı ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shrink-0">
              <Flame size={22} className="fill-white" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black text-orange-400 tracking-wider uppercase">GÜNÜN FLAŞ FIRSATLARI</span>
              <h3 className="text-lg sm:text-3xl font-black text-white leading-tight">
                Seçili Cihazlarda Ek İndirim!
              </h3>
            </div>
          </div>

          {/* Geri Sayım Kutusui */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-700">
            <Clock size={14} className="text-orange-400 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-300">Kalan Süre:</span>
            <div className="flex items-center gap-1 font-mono font-black text-xs sm:text-base text-orange-400">
              <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{format(timeLeft.hours)}</span>:
              <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{format(timeLeft.minutes)}</span>:
              <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{format(timeLeft.seconds)}</span>
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
                className="group flex flex-col justify-between bg-slate-950 text-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-slate-800 shadow-md hover:border-orange-500 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-1.5 py-0.5 rounded bg-orange-600/20 text-orange-400 font-black text-[8px] sm:text-[9px] uppercase border border-orange-500/30 truncate">
                      %15 İNDİRİM
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-orange-400 transition-colors"
                    >
                      <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  <div className="w-full aspect-square bg-slate-900 rounded-lg sm:rounded-xl p-2 sm:p-3 flex items-center justify-center overflow-hidden mb-2 sm:mb-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={family.model} className="h-full w-full object-contain group-hover:scale-108 transition-transform duration-500" />
                    ) : (
                      <div className="text-slate-400 text-xs font-bold">{family.brand}</div>
                    )}
                  </div>

                  <div className="text-left space-y-0.5">
                    <div className="text-[11px] sm:text-xs font-black text-white line-clamp-1">{family.brand} {family.model}</div>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400">
                      <Star size={10} className="fill-amber-400" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 mt-2 border-t border-slate-800 space-y-1.5">
                  {/* Stok Çubuğu */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-slate-400">
                      <span>Stok</span>
                      <span className="text-orange-400 font-extrabold">%{soldPercent}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: `${soldPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 flex-wrap gap-1">
                    <div className="text-left">
                      <div className="text-[9px] sm:text-[10px] text-slate-400 line-through font-bold">{fmt(oldPrice)} ₺</div>
                      <div className="text-xs sm:text-base font-black text-orange-400 leading-none">{fmt(family.minPrice)} ₺</div>
                    </div>
                    <span className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-orange-600 text-white font-extrabold text-[10px] sm:text-xs shadow-xs">
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
