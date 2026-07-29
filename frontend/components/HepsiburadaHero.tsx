'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, ShieldCheck, RefreshCcw, CreditCard,
  Sparkles, Truck, Lock, BadgeCheck, Flame, Clock, Laptop, Smartphone
} from 'lucide-react';

const HEPSI_TILES = [
  { label: 'Hemen Seç', badge: 'Avantajlar', href: '/trade-in', icon: RefreshCcw, bg: 'bg-orange-600' },
  { label: 'Elektronik', badge: 'Kaçmaz', href: '/?cat=Telefon', icon: Smartphone, bg: 'bg-orange-500' },
  { label: 'Hepsipay 7/24', badge: 'Kredi', href: '/?promo=taksit', icon: CreditCard, bg: 'bg-amber-600' },
  { label: 'Teknoloji', badge: 'Fırsatlar', href: '/ai-finder', icon: Sparkles, bg: 'bg-orange-600' },
  { label: 'Sepette İndirim', badge: 'Net İndirim', href: '/?promo=kampanya', icon: Flame, bg: 'bg-orange-500' },
  { label: '12 Taksit', badge: 'Sıfır Faiz', href: '/?promo=taksit', icon: CreditCard, bg: 'bg-amber-600' },
  { label: 'Tekno Çarşamba', badge: 'Büyük İndirim', href: '/?cat=S%C4%B1f%C4%B1r', icon: BadgeCheck, bg: 'bg-orange-600' },
  { label: 'Son İndirimler', badge: 'Kaçırma', href: '/sell', icon: Clock, bg: 'bg-orange-500' },
  { label: 'Escrow Güvence', badge: 'Paranız Güvende', href: '/garanti', icon: Lock, bg: 'bg-amber-700' },
  { label: 'Yetkili Bayiler', badge: '150+ Mağaza', href: '/magazalar', icon: ShieldCheck, bg: 'bg-orange-600' },
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
    <div className="w-full bg-slate-100/60 py-4 border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-4">

        {/* ── 1. Hepsiburada Birebir Turuncu Kare Tile Barı ── */}
        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto py-1">
          {HEPSI_TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                href={t.href}
                className="group flex-shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-orange-400 transition-all w-[96px] text-center"
              >
                <div className={`w-12 h-10 rounded-xl ${t.bg} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <div className="leading-tight">
                  <div className="text-[9px] font-black text-orange-600 uppercase tracking-wider">{t.badge}</div>
                  <div className="text-[11px] font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors truncate w-full">
                    {t.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── 2. Hepsiburada Ana Sahne: Sol Slider (%70) + Sağ Fırsat Kutusu (%30) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Sol Slider (%70 - lg:col-span-8) */}
          <div className="lg:col-span-8 relative h-[360px] md:h-[400px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-lg flex flex-col justify-between group">
            
            {/* Arka Plan Görselleri */}
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

            {/* Sol Karanlık Degrade Katmanı */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-10" />

            {/* Metin İçeriği */}
            <div className="relative z-20 p-6 md:p-10 max-w-xl text-left text-white space-y-3 my-auto">
              <span className="inline-block px-3.5 py-1 rounded-full bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-md">
                {slides[activeSlide].badge}
              </span>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                {slides[activeSlide].title}
              </h2>

              <p className="text-sm sm:text-base font-medium text-orange-100 leading-relaxed">
                {slides[activeSlide].subtitle}
              </p>

              <div className="pt-2">
                <Link
                  href={slides[activeSlide].ctaLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs shadow-xl shadow-orange-500/35 transition-all hover:scale-105"
                >
                  <span>{slides[activeSlide].ctaText}</span>
                  <ArrowRight size={16} strokeWidth={3} />
                </Link>
              </div>
            </div>

            {/* Hepsiburada Stili Pagination Sayaç Kutusu (1/16) */}
            <div className="relative z-20 pb-4 pr-6 flex items-center justify-end">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {activeSlide + 1} / {slides.length}
              </span>
            </div>
          </div>

          {/* Sağ Fırsat Kutusu (%30 - lg:col-span-4 - BİREBİR HEPSİBURADA FIRSATLARI KAÇIRMA KUTUSU) */}
          <div className="lg:col-span-4 h-[360px] md:h-[400px] rounded-3xl bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 p-6 text-white flex flex-col justify-between shadow-lg border border-orange-400 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                  Fırsatları Kaçırma
                </h3>
                <Flame size={28} className="text-amber-300 animate-bounce" />
              </div>

              <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-md space-y-3">
                <div className="text-xs font-black text-orange-600 uppercase tracking-wider">
                  Seçili Yenilenmiş Cihazlarda
                </div>
                <div className="text-sm font-black text-slate-900 leading-tight">
                  Sepette %15 Ek İndirim Fırsatı!
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-extrabold text-slate-700">
                  <span>iPhone 14 Pro 128GB</span>
                  <span className="text-orange-600 font-black">38.200 ₺</span>
                </div>
              </div>
            </div>

            <Link
              href="/?promo=kampanya"
              className="w-full py-3.5 rounded-xl bg-white hover:bg-orange-50 text-orange-600 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Kampanyalı Ürünleri Keşfet</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
