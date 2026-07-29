'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, Zap, ArrowRight, Star, Heart } from 'lucide-react';
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
    <div className="w-full my-8">
      <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-orange-400">
        {/* Arka plan radyal ışıklar */}
        <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse" />

        {/* ── Üst Başlık & Geri Sayım Sayacı ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center shadow-md shrink-0">
              <Flame size={26} className="fill-orange-600" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-200 tracking-wider uppercase">GÜNÜN FLAŞ FIRSATLARI</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Seçili Cihazlarda Sepette Ek İndirim!
              </h3>
            </div>
          </div>

          {/* Geri Sayım Kutusui */}
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
            <Clock size={18} className="text-amber-300" />
            <span className="text-xs font-bold text-amber-100">Kalan Süre:</span>
            <div className="flex items-center gap-1 font-mono font-black text-base text-white">
              <span className="bg-white/20 px-2 py-0.5 rounded">{format(timeLeft.hours)}</span>:
              <span className="bg-white/20 px-2 py-0.5 rounded">{format(timeLeft.minutes)}</span>:
              <span className="bg-white/20 px-2 py-0.5 rounded">{format(timeLeft.seconds)}</span>
            </div>
          </div>
        </div>

        {/* ── Flaş Ürün Kartları Izgarası ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dealProducts.map((family, idx) => {
            const imgSrc = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
            const oldPrice = Math.round(family.minPrice * 1.18);
            const href = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;
            const soldPercent = 75 + idx * 6;

            return (
              <Link
                key={family.model}
                href={href}
                className="group flex flex-col justify-between bg-white text-slate-900 rounded-2xl p-4 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-black text-[9px] uppercase border border-orange-200">
                      SEPETTE %15 EK İNDİRİM
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 transition-colors"
                    >
                      <Heart size={14} />
                    </button>
                  </div>

                  <div className="w-full aspect-square bg-slate-50 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={family.model} className="h-full w-full object-contain group-hover:scale-108 transition-transform duration-500" />
                    ) : (
                      <div className="text-slate-400 text-xs font-bold">{family.brand}</div>
                    )}
                  </div>

                  <div className="text-left space-y-1">
                    <div className="text-xs font-black text-slate-900 line-clamp-1">{family.brand} {family.model}</div>
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500">
                      <Star size={11} className="fill-amber-400" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 space-y-2">
                  {/* Stok Çubuğu */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Stok Durumu</span>
                      <span className="text-orange-600 font-extrabold">%{soldPercent} Satıldı</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" style={{ width: `${soldPercent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 line-through font-bold">{fmt(oldPrice)} ₺</div>
                      <div className="text-base font-black text-orange-600 leading-none">{fmt(family.minPrice)} ₺</div>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-extrabold text-xs shadow-xs group-hover:bg-orange-700 transition-colors">
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
