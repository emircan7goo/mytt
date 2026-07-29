'use client';
import { useRef } from 'react';
import Link from 'next/link';
import {
  TrendingDown, Zap, RefreshCcw, ShieldCheck, Trophy,
  CreditCard, Lock, Store, Sparkles, Truck, ChevronRight, ChevronLeft
} from 'lucide-react';

const CIRCLE_ITEMS = [
  { label: 'Fiyatı Düşenler', badge: 'İndirim', href: '/?promo=kampanya', icon: TrendingDown, color: 'from-[var(--k-hot)] to-[var(--k-hot)]' },
  { label: 'Anında Sat', badge: 'Hızlı Satış', href: '/sell', icon: Zap, color: 'from-[var(--k-hot-deep)] to-[var(--k-hot)]' },
  { label: 'Takas', badge: 'Takas', href: '/trade-in', icon: RefreshCcw, color: 'from-[var(--k-hot-deep)] to-[var(--k-hot)]' },
  { label: '12 Ay Garanti', badge: 'Garanti', href: '/garanti', icon: ShieldCheck, color: 'from-[var(--k-hot)] to-[var(--k-hot-deep)]' },
  { label: 'Süper Fırsat', badge: 'Flaş', href: '/?promo=taksit', icon: Trophy, color: 'from-[var(--k-hot-deep)] to-[var(--k-hot)]' },
  { label: '12 Taksit', badge: 'Taksit', href: '/?promo=taksit', icon: CreditCard, color: 'from-[var(--k-hot)] to-[var(--k-hot)]' },
  { label: 'Escrow Güvence', badge: 'Güvenli', href: '/garanti', icon: Lock, color: 'from-[var(--k-hot)] to-[var(--k-hot-deep)]' },
  { label: 'Yetkili Bayiler', badge: '150+ Bayi', href: '/magazalar', icon: Store, color: 'from-[var(--k-hot-deep)] to-[var(--k-hot)]' },
  { label: 'AI Telefon Bul', badge: 'Sihirbaz', href: '/ai-finder', icon: Sparkles, color: 'from-[var(--k-hot-deep)] to-[var(--k-hot)]' },
  { label: 'Ücretsiz Kargo', badge: 'Bedava', href: '/sell', icon: Truck, color: 'from-[var(--k-hot)] to-[var(--k-hot)]' },
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
    <div className="w-full bg-[var(--k-void)] py-3 sm:py-5 border-b border-[var(--k-line-2)] relative group overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 relative">

        {/* Sol Kaydırma Oku (Masaüstü) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--k-surface)] text-white shadow-xl border border-[var(--k-line-2)] items-center justify-center hover:bg-[var(--k-hot-deep)] hover:border-[var(--k-hot-deep)] transition-all opacity-0 group-hover:opacity-100"
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
                <div className="relative p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] shadow-[0_0_12px_rgba(255,96,0,0.3)] group-hover/item:shadow-[0_0_22px_rgba(255,96,0,0.7)] group-hover/item:scale-108 transition-all duration-300">
                  <div className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] rounded-full bg-[var(--k-void)] p-0.5 sm:p-1 flex items-center justify-center">
                    <div className={`w-full h-full rounded-full bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-inner`}>
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.2} />
                    </div>
                  </div>
                </div>

                {/* Metin Etiketi (Asla Kesilmez) */}
                <span className="text-[10px] sm:text-[12px] font-extrabold text-[var(--k-ink-2)] leading-tight group-hover/item:text-[var(--k-hot)] transition-colors whitespace-nowrap drop-shadow-xs">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Oku (Masaüstü) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--k-surface)] text-white shadow-xl border border-[var(--k-line-2)] items-center justify-center hover:bg-[var(--k-hot-deep)] hover:border-[var(--k-hot-deep)] transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={22} />
        </button>

      </div>
    </div>
  );
}
