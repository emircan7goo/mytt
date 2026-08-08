'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HepsiburadaHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const slides = [
    {
      id: 1,
      title: 'FIYATI İŞİNİ BİLEN TELEFONCU ESNAFI VERSİN!',
      subtitle: 'Tüm ticaret müşteri ile 150+ onaylı yetkili telefoncu esnafı arasında. Cihazını ihaleye çıkar, en yüksek teklifi sen seç!',
      badge: 'DOĞRUDAN ESNAF & MÜŞTERİ TİCARETİ',
      img: '/banners/clean_hero_1.svg?v=12',
      ctaText: 'Cihazını İhaleye Çıkar',
      ctaLink: '/sell',
    },
    {
      id: 2,
      title: 'YAN SANAYİ "YENİLENMİŞ" TELEFONLARA SON!',
      subtitle: 'Bizde çakma parça veya kalitesiz Çin ekranı yok! Sadece %100 Orijinal Sıfır veya Doğrulanmış İkinci El var.',
      badge: 'ÇAKMA PARÇASIZ %100 ORİJİNAL',
      img: '/banners/clean_hero_2.svg?v=12',
      ctaText: 'Orijinal Cihazları İncele',
      ctaLink: '/?cat=Apple',
    },
    {
      id: 3,
      title: '150+ YETKİLİ TELEFONCU CANLI İHALEDE',
      subtitle: 'Otomatik alım robotlarına veya komisyonculara cihaz kaptırma! İşi bilen telefoncular gerçek değerini versin.',
      badge: 'CANLI AÇIK ARTIRMA',
      img: '/banners/clean_hero_3.svg?v=12',
      ctaText: 'Hemen Teklif Al',
      ctaLink: '/sell',
    },
    {
      id: 4,
      title: 'VADE FARKSIZ 12 TAKSİT İMKANI',
      subtitle: 'Tüm anlaşmalı kredi kartlarına özel vade farksız 12 aya varan taksit avantajıyla hemen sahip ol.',
      badge: 'PEŞİN FİYATINA TAKSİT',
      img: '/banners/clean_hero_4.svg?v=12',
      ctaText: 'Taksitli Fırsatları İncele',
      ctaLink: '/?promo=taksit',
    },
    {
      id: 5,
      title: '%100 ESCROW GÜVENCELİ ALIM SATIM',
      subtitle: 'Paranız Escrow havuz hesabında güvende. Cihazınızı teslim alıp onaylayana kadar paranız %100 korumada.',
      badge: 'SIRTINIZ YERE GELMESİN',
      img: '/banners/clean_hero_5.svg?v=12',
      ctaText: 'Escrow Sistemi Nasıl Çalışır?',
      ctaLink: '/garanti',
    },
  ];

  useEffect(() => {
    slides.forEach((s) => {
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = s.img;
      }
    });

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

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <div className="w-full max-w-full bg-[var(--k-void)] border-b border-[var(--k-line-2)] py-1.5 sm:py-4 overflow-hidden select-none">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-8">

        {/* SWIPE DESTEKLİ DOKUNMATİK BANNER CONTAINER */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[165px] sm:h-[400px] md:h-[420px] overflow-hidden rounded-xl sm:rounded-3xl border border-[var(--k-line-2)] bg-[var(--k-void)] shadow-2xl flex flex-col justify-between group touch-pan-y"
        >
          
          {/* Arka Plan Görselleri */}
          {slides.map((s, idx) => (
            <img
              key={s.id}
              src={s.img}
              alt={s.title}
              className={`absolute inset-0 w-full h-full object-cover object-right transition-opacity duration-700 pointer-events-none ${
                activeSlide === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            />
          ))}

          {/* Yumuşatılmış Sol Şeffaf Degrade Katmanı */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-transparent z-10 pointer-events-none" />

          {/* Sol Navigasyon Oku (Masaüstü) */}
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[var(--k-void)] hover:bg-[var(--k-hot-deep)] text-white backdrop-blur-md border border-[var(--k-line-2)] items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Metin İçeriği (Mobilde Kompakt & Şık Boyut) */}
          <div className="relative z-20 p-3 sm:p-12 max-w-[70%] sm:max-w-xl lg:max-w-2xl text-left text-white space-y-1 sm:space-y-4 my-auto min-w-0">
            <span className="inline-block px-2 py-0.5 sm:px-4 sm:py-1.5 rounded-full bg-[var(--k-hot-deep)] text-white font-black text-[8px] sm:text-xs uppercase tracking-wider shadow-md">
              {slides[activeSlide].badge}
            </span>

            <h2 className="text-xs sm:text-3xl lg:text-4xl font-black tracking-tight leading-snug text-white drop-shadow-md break-words">
              {slides[activeSlide].title}
            </h2>

            <p className="hidden sm:block text-sm sm:text-base font-medium text-[var(--k-hot-2)] leading-relaxed max-w-lg break-words">
              {slides[activeSlide].subtitle}
            </p>

            <div className="pt-0.5 sm:pt-3">
              <Link
                href={slides[activeSlide].ctaLink}
                className="inline-flex items-center gap-1 px-3 py-1 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-[9px] sm:text-sm shadow-xl shadow-[var(--k-hot-glow)] transition-all hover:scale-105"
              >
                <span>{slides[activeSlide].ctaText}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4" strokeWidth={3} />
              </Link>
            </div>
          </div>

          {/* Sağ Navigasyon Oku (Masaüstü) */}
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-[var(--k-void)] hover:bg-[var(--k-hot-deep)] text-white backdrop-blur-md border border-[var(--k-line-2)] items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel Noktaları */}
          <div className="relative z-20 pb-1.5 sm:pb-5 flex items-center justify-center gap-1 sm:gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`h-1 sm:h-2 rounded-full transition-all ${activeSlide === idx ? 'w-4 sm:w-8 bg-[var(--k-hot)]' : 'w-1 sm:w-2 bg-[var(--k-surface)]'}`}
                aria-label={`Slayt ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
