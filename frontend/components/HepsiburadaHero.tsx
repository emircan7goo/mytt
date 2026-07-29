'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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
    {
      id: 3,
      title: 'SIFIR VE HATASIZ 2. EL TELEFONLAR',
      subtitle: '32-nokta ekspertiz onaylı, 12 ay resmi garantili, sıfır veya hatasız ikinci el akıllı telefonlar.',
      badge: 'TSE ONAYLI GÜVENCE',
      img: '/banners/clean_hero_3.jpg',
      ctaText: 'Garantili Cihazları Gör',
      ctaLink: '/?cat=S%C4%B1f%C4%B1r',
    },
    {
      id: 4,
      title: 'VADE FARKSIZ 12 TAKSİT İMKANI',
      subtitle: 'Tüm anlaşmalı kredi kartlarına özel vade farksız 12 aya varan taksit avantajıyla hemen sahip ol.',
      badge: 'PEŞİN FİYATINA TAKSİT',
      img: '/banners/clean_hero_4.jpg',
      ctaText: 'Taksitli Fırsatları İncele',
      ctaLink: '/?promo=taksit',
    },
    {
      id: 5,
      title: '%100 ESCROW GÜVENCELİ ALIM SATIM',
      subtitle: 'Paranız Escrow havuz hesabında güvende. Cihazınızı teslim alıp onaylayana kadar paranız %100 korumada.',
      badge: 'SIRTINIZ YERE GELMESİN',
      img: '/banners/clean_hero_5.jpg',
      ctaText: 'Escrow Sistemi Nasıl Çalışır?',
      ctaLink: '/garanti',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full max-w-full bg-[var(--k-hot-wash)]/40 border-b border-[var(--k-line-hot)]/80 py-4 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* ── TAM BOYUT DEV HERO BANNER (Sıfır & Hatasız 2. El Vurgusu) ── */}
        <div className="relative w-full h-[360px] sm:h-[400px] md:h-[420px] overflow-hidden rounded-3xl border border-[var(--k-line-hot)] bg-[var(--k-void)] shadow-xl flex flex-col justify-between group">
          
          {/* Arka Plan Görselleri */}
          {slides.map((s, idx) => (
            <img
              key={s.id}
              src={s.img}
              alt={s.title}
              className={`absolute inset-0 w-full h-full object-cover object-right transition-opacity duration-700 ${
                activeSlide === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            />
          ))}

          {/* Sol Karanlık Degrade Katmanı */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent z-10" />

          {/* Sol Navigasyon Oku */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--k-void)]/50 hover:bg-[var(--k-hot-deep)] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Metin İçeriği */}
          <div className="relative z-20 p-5 sm:p-8 md:p-12 max-w-xl lg:max-w-2xl text-left text-white space-y-3 sm:space-y-4 my-auto min-w-0">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[var(--k-hot-deep)] text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-md">
              {slides[activeSlide].badge}
            </span>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md break-words">
              {slides[activeSlide].title}
            </h2>

            <p className="text-xs sm:text-base font-medium text-[var(--k-hot-2)] leading-relaxed max-w-lg break-words line-clamp-3 sm:line-clamp-none">
              {slides[activeSlide].subtitle}
            </p>

            <div className="pt-2 sm:pt-3">
              <Link
                href={slides[activeSlide].ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-[var(--k-hot-ink)] hover:text-white font-black text-xs sm:text-sm shadow-xl shadow-[var(--k-hot-glow)]/35 transition-all hover:scale-105"
              >
                <span>{slides[activeSlide].ctaText}</span>
                <ArrowRight size={16} className="sm:w-4 sm:h-4" strokeWidth={3} />
              </Link>
            </div>
          </div>

          {/* Sağ Navigasyon Oku */}
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[var(--k-void)]/50 hover:bg-[var(--k-hot-deep)] text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>

          {/* Carousel Noktaları */}
          <div className="relative z-20 pb-4 sm:pb-5 flex items-center justify-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`k-tap h-2 rounded-full transition-all ${activeSlide === idx ? 'w-8 bg-[var(--k-hot)]' : 'w-2 bg-[var(--k-surface)]/40'}`}
                aria-label={`Slayt ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
