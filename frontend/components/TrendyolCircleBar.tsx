'use client';
import { useRef } from 'react';
import Link from 'next/link';
import {
  TrendingDown, Zap, RefreshCcw, ShieldCheck, Trophy,
  CreditCard, Lock, Store, Sparkles, Truck, ChevronRight, ChevronLeft
} from 'lucide-react';

/* Her balonun kendi üretilmiş illüstrasyonu var (public/bubbles/*.png).
   `icon` alanı YEDEK olarak duruyor: görsel bir sebeple yüklenmezse
   onErrorda lucide ikonuna düşülür, böylece kırık görsel çıkmaz. */
const CIRCLE_ITEMS = [
  { label: 'Bugün Fiyatı Düşenler', badge: 'İndirim',   href: '/?promo=kampanya', icon: TrendingDown, img: '/bubbles/fiyat-dusenler.png' },
  { label: 'Cihazını Anında Sat',   badge: 'Hızlı Satış', href: '/sell',          icon: Zap,          img: '/bubbles/aninda-sat.png' },
  { label: 'Eskiyi Getir Yeniyi Al',badge: 'Takas',      href: '/trade-in',       icon: RefreshCcw,   img: '/bubbles/takas.png' },
  { label: 'TSE 12 Ay Garantili',   badge: 'Garanti',    href: '/garanti',        icon: ShieldCheck,  img: '/bubbles/tse-garanti.png' },
  { label: 'Günün Süper Fırsatı',   badge: 'Flaş',       href: '/?promo=taksit',  icon: Trophy,       img: '/bubbles/gunun-firsati.png' },
  { label: 'Vade Farksız 12 Taksit',badge: 'Taksit',     href: '/?promo=taksit',  icon: CreditCard,   img: '/bubbles/taksit.png' },
  { label: '%100 Escrow Koruma',    badge: 'Güvenli',    href: '/garanti',        icon: Lock,         img: '/bubbles/escrow.png' },
  { label: 'Yetkili Bayiler',       badge: '150+ Bayi',  href: '/magazalar',      icon: Store,        img: '/bubbles/yetkili-bayi.png' },
  { label: 'AI Telefon Bul',        badge: 'Sihirbaz',   href: '/ai-finder',      icon: Sparkles,     img: '/bubbles/ai-bulucu.png' },
  { label: 'Adresten Ücretsiz Kargo', badge: 'Bedava',   href: '/sell',           icon: Truck,        img: '/bubbles/ucretsiz-kargo.png' },
];

export default function TrendyolCircleBar() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[var(--k-canvas)] py-3 sm:py-6 border-b border-[var(--k-line)]/80 relative group overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8 relative">

        {/* Sol Kaydırma Butonu (Masaüstünde Görünür) */}
        <button
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--k-canvas)]/90 text-white shadow-xl border border-[var(--k-line)] items-center justify-center hover:bg-[var(--k-hot-deep)] hover:border-[var(--k-hot-deep)] transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sola kaydır"
        >
          <ChevronLeft size={22} />
        </button>

        {/* ── YEREL MOBİL UYGULAMA KALİTESİNDE ULTRA ŞIK STORY BAR ── */}
        <div
          ref={scrollRef}
          className="k-scroll-x items-center gap-3.5 sm:gap-8 py-1 scroll-smooth max-w-full"
        >
          {CIRCLE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-1.5 sm:gap-3 group/item shrink-0 w-[84px] sm:w-[96px] text-center select-none"
              >
                {/* Halka + üretilmiş illüstrasyon (ikon yedekli) */}
                <div className="relative p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-[var(--k-hot)] via-[var(--k-hot-2)] to-[var(--k-hot-deep)] shadow-[0_0_15px_rgba(255,106,26,0.35)] group-hover/item:shadow-[0_0_28px_rgba(255,106,26,0.7)] group-hover/item:scale-105 transition-all duration-300">
                  <div className="w-[62px] h-[62px] sm:w-[76px] sm:h-[76px] rounded-full bg-[var(--k-void)] p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.img}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        // Görsel gelmezse ikon yedeğini göster
                        const el = e.currentTarget;
                        el.style.display = 'none';
                        el.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-[var(--k-hot)] to-[var(--k-hot-deep)] text-[var(--k-hot-ink)] items-center justify-center flex">
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.2} />
                    </div>
                  </div>
                </div>

                {/* Metin Etiketi */}
                <span className="text-[10px] sm:text-[12px] font-black text-[var(--k-ink)] leading-tight group-hover/item:text-[var(--k-hot)] transition-colors line-clamp-2 drop-shadow-sm">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sağ Kaydırma Butonu (Masaüstünde Görünür) */}
        <button
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[var(--k-canvas)]/90 text-white shadow-xl border border-[var(--k-line)] items-center justify-center hover:bg-[var(--k-hot-deep)] hover:border-[var(--k-hot-deep)] transition-all opacity-0 group-hover:opacity-100"
          aria-label="Sağa kaydır"
        >
          <ChevronRight size={22} />
        </button>

      </div>
    </div>
  );
}
