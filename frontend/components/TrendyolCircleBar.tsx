'use client';
import { useRef } from 'react';
import Link from 'next/link';
import {
  TrendingDown, Zap, RefreshCcw, ShieldCheck, Trophy,
  CreditCard, Lock, Store, Sparkles, Truck, ChevronRight, ChevronLeft
} from 'lucide-react';

const CIRCLE_ITEMS = [
  { label: 'Fiyatı Düşenler', badge: 'İndirim', href: '/?promo=kampanya', icon: TrendingDown, color: 'from-orange-500 to-amber-500' },
  { label: 'Anında Sat', badge: 'Hızlı Satış', href: '/sell', icon: Zap, color: 'from-orange-600 to-orange-500' },
  { label: 'Takas', badge: 'Takas', href: '/trade-in', icon: RefreshCcw, color: 'from-amber-600 to-orange-500' },
  { label: '12 Ay Garanti', badge: 'Garanti', href: '/garanti', icon: ShieldCheck, color: 'from-orange-500 to-amber-600' },
  { label: 'Süper Fırsat', badge: 'Flaş', href: '/?promo=taksit', icon: Trophy, color: 'from-orange-600 to-amber-500' },
  { label: '12 Taksit', badge: 'Taksit', href: '/?promo=taksit', icon: CreditCard, color: 'from-amber-500 to-orange-500' },
  { label: 'Escrow Güvence', badge: 'Güvenli', href: '/garanti', icon: Lock, color: 'from-orange-500 to-amber-600' },
  { label: 'Yetkili Bayiler', badge: '150+ Bayi', href: '/magazalar', icon: Store, color: 'from-orange-600 to-amber-500' },
  { label: 'AI Telefon Bul', badge: 'Sihirbaz', href: '/ai-finder', icon: Sparkles, color: 'from-amber-600 to-orange-500' },
  { label: 'Ücretsiz Kargo', badge: 'Bedava', href: '/sell', icon: Truck, color: 'from-orange-500 to-amber-500' },
];

export default function TrendyolCircleBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#090D16] py-3 sm:py-5 border-b border-slate-800/60 relative group overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 relative">

        {/* Sol Kaydırma Oku (Masaüstü) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-xl border border-slate-700 items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={22} />
        </button>

        {/* MOBİL HİKAYE BALONCUKLARI — TEMİZ, KESİLMEYEN VE LÜKS ETİKETLER */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex items-center gap-4 sm:gap-8 overflow-x-auto py-1 scroll-smooth max-w-full"
        >
          {CIRCLE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 sm:gap-2.5 group/item shrink-0 w-[64px] sm:w-[88px] text-center select-none"
              >
                {/* Lüks Neon Halka Daire İkon */}
                <div className="relative p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-[0_0_12px_rgba(255,96,0,0.3)] group-hover/item:shadow-[0_0_22px_rgba(255,96,0,0.7)] group-hover/item:scale-108 transition-all duration-300">
                  <div className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] rounded-full bg-slate-950 p-0.5 sm:p-1 flex items-center justify-center">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-inner`}>
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.2} />
                    </div>
                  </div>
                </div>

                {/* Metin Etiketi (Asla Kesilmez) */}
                <span className="text-[10px] sm:text-[12px] font-extrabold text-slate-100 leading-tight group-hover/item:text-orange-400 transition-colors whitespace-nowrap drop-shadow-xs">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Oku (Masaüstü) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-white shadow-xl border border-slate-700 items-center justify-center hover:bg-orange-600 hover:border-orange-500 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={22} />
        </button>

      </div>
    </div>
  );
}
