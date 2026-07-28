'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, ShieldCheck, RefreshCcw, CreditCard,
  Sparkles, Truck, Lock, BadgeCheck, Flame, ChevronRight,
  Clock, Heart, ShoppingCart
} from 'lucide-react';

const QUICK_TILES = [
  { label: 'Eskiyi Ver Yeniyi Al', badge: 'Takas', href: '/trade-in', icon: RefreshCcw, color: 'bg-orange-500 text-white' },
  { label: 'Cihazını Hemen Sat', badge: 'En Yüksek Teklif', href: '/sell', icon: Zap, color: 'bg-emerald-600 text-white' },
  { label: 'AI Telefon Bul', badge: 'YZ Sihirbazı', href: '/ai-finder', icon: Sparkles, color: 'bg-indigo-600 text-white' },
  { label: 'Vade Farksız 12 Taksit', badge: 'Sıfır Faiz', href: '/?promo=taksit', icon: CreditCard, color: 'bg-orange-600 text-white' },
  { label: 'Fırsatları Kaçırma', badge: 'Flaş İndirim', href: '/?promo=kampanya', icon: Flame, color: 'bg-red-500 text-white' },
  { label: 'TSE Garantili Cihazlar', badge: '12 Ay Garanti', href: '/?cat=S%C4%B1f%C4%B1r', icon: BadgeCheck, color: 'bg-emerald-700 text-white' },
  { label: 'Günün Süper Fiyatı', badge: 'Son Ürünler', href: '/?promo=paket', icon: Clock, color: 'bg-amber-500 text-white' },
  { label: 'Adresten Bedava Kargo', badge: 'Ücretsiz', href: '/sell', icon: Truck, color: 'bg-blue-600 text-white' },
  { label: '%100 Escrow Koruma', badge: 'Paranız Güvende', href: '/garanti', icon: Lock, color: 'bg-slate-900 text-white' },
  { label: 'Yetkili Bayi Pazarı', badge: '150+ Mağaza', href: '/magazalar', icon: ShieldCheck, color: 'bg-teal-600 text-white' },
];

export default function HepsiburadaHero() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'ESKİYİ GETİR, YENİYİ AL!',
      subtitle: 'Eski cihazının değerini anında öğren, yeni telefonunda net indirim avantajından yararlan.',
      badge: 'MYTT PREMIUM TAKAS FIRSATI',
      img: '/banners/clean_hero_1.jpg',
      ctaText: 'Değerini Hesapla',
      ctaLink: '/trade-in',
    },
    {
      id: 2,
      title: 'CİHAZINI EN YÜKSEK FİYATA SAT!',
      subtitle: '150+ Yetkili bayi kapalı teklifte yarışsın. En yüksek teklifi seç, kuryemiz kapından ücretsiz alsın.',
      badge: 'SAYILI SAATLER',
      img: '/banners/clean_hero_2.jpg',
      ctaText: 'Hemen Satış Başlat',
      ctaLink: '/sell',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full bg-slate-100/70 border-b border-slate-200 py-4">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-4">

        {/* ── 1. Hepsiburada Tarzı 10'lu Yatay İkon Barı (Bubbles) ────────── */}
        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto py-1">
          {QUICK_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                href={t.href}
                className="group flex-shrink-0 flex items-center gap-2.5 p-2.5 pr-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div className={`w-9 h-9 rounded-xl ${t.color} flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{t.badge}</div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                    {t.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── 2. İkili Dev Reklam Sahnesi (Sabit Yükseklik: h-[380px] md:h-[420px]) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

          {/* Sol taraf: Ana Banner Carousel (Col-Span-8) */}
          <div className="lg:col-span-8 relative h-[360px] md:h-[400px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-md flex flex-col justify-between group">
            
            {/* Arka Plan Görselleri (Sabit Boyut, Sıfır Yükseklik Değişimi) */}
            {slides.map((s, idx) => (
              <img
                key={s.id}
                src={s.img}
                alt={s.title}
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                  activeSlide === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
                }`}
              />
            ))}

            {/* Sol Karanlık Degrade Katmanı (Metin Okunurluğu İçin) */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-10" />

            {/* Metin İçeriği */}
            <div className="relative z-20 p-6 md:p-10 max-w-xl text-left text-white space-y-4 my-auto">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                {slides[activeSlide].badge}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                {slides[activeSlide].title}
              </h2>

              <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed">
                {slides[activeSlide].subtitle}
              </p>

              <div className="pt-2">
                <Link
                  href={slides[activeSlide].ctaLink}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  <span>{slides[activeSlide].ctaText}</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </div>

            {/* Carousel Noktaları */}
            <div className="relative z-20 pb-4 flex items-center justify-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all ${activeSlide === idx ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40'}`}
                  aria-label={`Slayt ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Sağ taraf: "Fırsatları Kaçırma" Kartı (Sabit Yükseklik) */}
          <div className="lg:col-span-4 h-[360px] md:h-[400px] rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 p-6 text-white shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-xs uppercase tracking-wider">
                  🔥 FIRSATLARI KAÇIRMA
                </span>
                <span className="text-[11px] font-bold text-orange-100">GÜNÜN FIRSATI</span>
              </div>

              <h3 className="text-xl font-black text-white leading-snug">
                Seçili Yenilenmiş Cihazlarda <span className="text-amber-200">Sepette %15 Ek İndirim!</span>
              </h3>
            </div>

            {/* Ürün Önizleme Kutusu */}
            <div className="relative z-10 bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-orange-100 flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 shrink-0 border border-slate-100 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&fit=crop&q=80"
                  alt="iPhone Fırsat"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left space-y-1">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">TSE 12 Ay Garanti</span>
                <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">iPhone 14 Pro 128GB</h4>
                <div className="text-sm font-black text-emerald-600">
                  38.200 ₺ <span className="text-[10px] text-slate-400 line-through font-normal">42.500 ₺</span>
                </div>
              </div>
            </div>

            <Link
              href="/?promo=kampanya"
              className="relative z-10 w-full py-3 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>Kampanyalı Ürünleri Keşfet</span>
              <ChevronRight size={16} strokeWidth={3} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
