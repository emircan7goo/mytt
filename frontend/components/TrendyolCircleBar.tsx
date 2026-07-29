'use client';
import { useRef } from 'react';
import Link from 'next/link';
import {
  TrendingDown, Zap, RefreshCcw, ShieldCheck, Trophy,
  CreditCard, Lock, Store, Sparkles, Truck, ChevronRight, ChevronLeft
} from 'lucide-react';

const CIRCLE_ITEMS = [
  { label: 'Bugün Fiyatı Düşenler', badge: 'İndirim', href: '/?promo=kampanya', icon: TrendingDown, color: 'from-orange-500 to-amber-500' },
  { label: 'Cihazını Anında Sat', badge: 'Hızlı Satış', href: '/sell', icon: Zap, color: 'from-orange-600 to-orange-500' },
  { label: 'Eskiyi Getir Yeniyi Al', badge: 'Takas', href: '/trade-in', icon: RefreshCcw, color: 'from-amber-600 to-orange-500' },
  { label: 'TSE 12 Ay Garantili', badge: 'Garanti', href: '/garanti', icon: ShieldCheck, color: 'from-orange-500 to-amber-600' },
  { label: 'Günün Süper Fırsatı', badge: 'Flaş', href: '/?promo=taksit', icon: Trophy, color: 'from-orange-600 to-amber-500' },
  { label: 'Vade Farksız 12 Taksit', badge: 'Taksit', href: '/?promo=taksit', icon: CreditCard, color: 'from-amber-500 to-orange-500' },
  { label: '%100 Escrow Koruma', badge: 'Güvenli', href: '/garanti', icon: Lock, color: 'from-orange-500 to-amber-600' },
  { label: 'Yetkili Bayiler', badge: '150+ Bayi', href: '/magazalar', icon: Store, color: 'from-orange-600 to-amber-500' },
  { label: 'AI Telefon Bul', badge: 'Sihirbaz', href: '/ai-finder', icon: Sparkles, color: 'from-amber-600 to-orange-500' },
  { label: 'Adresten Ücretsiz Kargo', badge: 'Bedava', href: '/sell', icon: Truck, color: 'from-orange-500 to-amber-500' },
];

export default function TrendyolCircleBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#090D16] py-6 border-b border-slate-800/80 relative group">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative">

        {/* Sol Kaydırma Butonu */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-xl border border-slate-700 flex items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={22} />
        </button>

        {/* ── BÜYÜTÜLMÜŞ LÜKS KOYU TEMALI DİJİTAL STORY BAR (w-[96px]) ── */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex items-center gap-6 sm:gap-8 overflow-x-auto py-2 scroll-smooth"
        >
          {CIRCLE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-3 group/item shrink-0 w-[96px] text-center"
              >
                {/* BÜYÜTÜLMÜŞ Daire Halka İkon (Işıldayan Canlı Turuncu Halka) */}
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_20px_rgba(255,96,0,0.35)] group-hover/item:shadow-[0_0_28px_rgba(255,96,0,0.7)] group-hover/item:scale-110 transition-all duration-300">
                  <div className="w-[76px] h-[76px] rounded-full bg-slate-950 p-1 flex items-center justify-center">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-inner`}>
                      <Icon size={30} strokeWidth={2.2} />
                    </div>
                  </div>
                </div>

                {/* Metin Etiketi */}
                <span className="text-[12px] font-black text-slate-100 leading-tight group-hover/item:text-orange-400 transition-colors line-clamp-2 drop-shadow-sm">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Butonu */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-xl border border-slate-700 flex items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={22} />
        </button>

      </div>
    </div>
  );
}
