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
      title: 'TSE GARANTİLİ YENİLENMİŞ TELEFONLAR',
      subtitle: '32-nokta ekspertiz onaylı, 12 ay resmi garantili ve %100 orijinal yenilenmiş akıllı telefonlar.',
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
    <div className="w-full bg-orange-50/40 border-b border-orange-200/80 py-4">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">

        {/* ── TAM BOYUT 5'Lİ DEV HERO BANNER (Navigasyon Okları Eklendi) ── */}
        <div className="relative w-full h-[380px] md:h-[420px] overflow-hidden rounded-3xl border border-orange-300 bg-slate-950 shadow-xl flex flex-col justify-between group">
          
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

          {/* Sol Karanlık Degrade Katmanı (Metin ve Buton Çakışmasını %100 Önler) */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent z-10" />

          {/* Sol Navigasyon Oku */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-orange-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            aria-label="Önceki slayt"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Metin İçeriği */}
          <div className="relative z-20 p-8 md:p-12 max-w-2xl text-left text-white space-y-4 my-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-md">
              {slides[activeSlide].badge}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {slides[activeSlide].title}
            </h2>

            <p className="text-base sm:text-lg font-medium text-orange-100 leading-relaxed max-w-xl">
              {slides[activeSlide].subtitle}
            </p>

            <div className="pt-3">
              <Link
                href={slides[activeSlide].ctaLink}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/35 transition-all hover:scale-105"
              >
                <span>{slides[activeSlide].ctaText}</span>
                <ArrowRight size={18} strokeWidth={3} />
              </Link>
            </div>
          </div>

          {/* Sağ Navigasyon Oku */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-orange-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            aria-label="Sonraki slayt"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel Noktaları */}
          <div className="relative z-20 pb-5 flex items-center justify-center gap-2.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveSlide(idx)}
                className={`h-2.5 rounded-full transition-all ${activeSlide === idx ? 'w-10 bg-orange-500' : 'w-2.5 bg-white/40'}`}
                aria-label={`Slayt ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
