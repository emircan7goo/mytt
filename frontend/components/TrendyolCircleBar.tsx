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
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-white py-4 border-b border-slate-100 relative group">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative">

        {/* Sol Kaydırma Butonu */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={18} />
        </button>

        {/* ── Trendyol Tarzı Yuvarlak Daire Story Barı ── */}
        <div
          ref={scrollRef}
          className="no-scrollbar flex items-center gap-6 overflow-x-auto py-1 scroll-smooth"
        >
          {CIRCLE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-2 group/item shrink-0 w-[84px] text-center"
              >
                {/* Daire Halka İkon */}
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 shadow-sm group-hover/item:scale-108 transition-transform duration-300">
                  <div className="w-[64px] h-[64px] rounded-full bg-white p-1 flex items-center justify-center">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-inner`}>
                      <Icon size={24} strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Metin Etiketi */}
                <span className="text-[11px] font-extrabold text-slate-700 leading-tight group-hover/item:text-orange-600 transition-colors line-clamp-2">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Butonu */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={18} />
        </button>

      </div>
    </div>
  );
}
