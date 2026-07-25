'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { subscribeBuilderPreview, getBuilderHeroSlides, getBuilderPreview } from '@/lib/builder-preview';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { API_BASE } from '@/lib/apiBase';

interface Slide {
  id: string;
  imageUrl: string;
  title?: string | null;
  subtitle?: string | null;
  btnLeftText?: string | null;
  btnLeftLink?: string | null;
  btnRightText?: string | null;
  btnRightLink?: string | null;
  textColor?: string | null;
  textAlignment?: 'left' | 'center' | 'right' | null;
  overlayOpacity?: number | null;
  isActive?: boolean;
}

const FALLBACK: Slide = {
  id: 'fallback',
  imageUrl: '/banners/hero-apple.png',
  title: 'Güvenle Al, Güvenle Sat.',
  subtitle: "Türkiye'nin en güvenilir cihaz pazaryeri. Sadece sıfır ve hatasız 2. el — her cihaz test edilmiş, her satış güvence altında.",
  btnLeftText: 'Cihazları Keşfet',
  btnLeftLink: '/',
  btnRightText: 'Bayi Ol',
  btnRightLink: '/register-dealer',
  textColor: '#111827',
  textAlignment: 'left',
  overlayOpacity: 0,
};

export default function HeroSlider() {
  const [slides, setSlides]         = useState<Slide[]>([]);
  const [current, setCurrent]       = useState(0);
  const [prev, setPrev]             = useState<number | null>(null);
  const [animating, setAnimating]   = useState(false);
  const [paused, setPaused]         = useState(false);
  const [, forceRender]             = useState(0);
  const timerRef                    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return subscribeBuilderPreview(() => forceRender((n) => n + 1));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/hero-slides`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Slide[]) => { if (data.length > 0) setSlides(data); })
      .catch(() => {});
  }, []);

  const previewSlides = getBuilderHeroSlides();
  const previewSettings = getBuilderPreview();

  if (previewSettings?.showHeroSlider === false) return null;

  const raw     = (previewSlides || slides).filter((s: Slide) => s.isActive !== false);
  const display = raw.length > 0 ? raw : [FALLBACK];
  const total   = display.length;

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current || total <= 1) return;
    setPrev(current);
    setCurrent(idx);
    setAnimating(true);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 650);
  }, [animating, current, total]);

  const goNext = useCallback(() => goTo((current + 1) % total), [goTo, current, total]);
  const goPrev = useCallback(() => goTo((current - 1 + total) % total), [goTo, current, total]);

  // Auto-play
  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current = setInterval(goNext, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total, paused, goNext]);

  // imageUrl CSS gradient mi yoksa gerçek resim mi?
  const isCssBackground = (url: string) =>
    !url ||
    url.startsWith('linear-gradient') ||
    url.startsWith('radial-gradient') ||
    /^#[0-9a-fA-F]{3,8}$/.test(url.trim());

  // Metin rengi açık mı koyu mu? — kart zeminini buna göre seçiyoruz,
  // aksi halde admin beyaz yazı ayarlarsa açık camlı kart üstünde kaybolur.
  const isLightColor = (hex: string) => {
    const m = hex.replace('#', '');
    const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
    const r = parseInt(full.slice(0, 2), 16) || 0;
    const g = parseInt(full.slice(2, 4), 16) || 0;
    const b = parseInt(full.slice(4, 6), 16) || 0;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  };

  const renderSlideContent = (slide: Slide, isActive: boolean, isPrev: boolean) => {
    const textColor   = slide.textColor || '#0f172a';
    const isLightText = isLightColor(textColor);
    const textAlign   = slide.textAlignment || 'left';
    const isGradient  = isCssBackground(slide.imageUrl);
    const hasContent  = !!(slide.title || slide.subtitle || slide.btnLeftText || slide.btnRightText);

    const alignClass =
      textAlign === 'center' ? 'items-center text-center' :
      textAlign === 'right'  ? 'items-end text-right'     :
      'items-start text-left';

    // We remove the heavy solid overlay to make the image fully visible and vivid.
    // Instead of blocking 50% of the screen, we'll just use a subtle soft shadow gradient if needed.
    // Açık metin (koyu kart) için beyaz "light leak" ters etki yapar — o durumda karartma uygularız.
    const leakColor = isLightText ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)';
    const overlayGradient = isGradient
      ? 'none'
      : textAlign === 'center'
        ? `linear-gradient(to bottom, ${leakColor.replace('0.55', '0.4').replace('0.7', '0.5')} 0%, transparent 100%)`
        : textAlign === 'right'
          ? `linear-gradient(to left, ${leakColor} 0%, transparent 50%)`
          : `linear-gradient(to right, ${leakColor} 0%, transparent 50%)`;
    const blendMode = isLightText ? 'multiply' : 'screen';

    return (
      <div
        key={slide.id}
        className="absolute inset-0"
        style={{
          opacity: isActive ? 1 : isPrev ? 0 : 0,
          transform: isActive ? 'scale(1)' : isPrev ? 'scale(1.04)' : 'scale(0.98)',
          transition: isActive || isPrev
            ? 'opacity 0.65s cubic-bezier(0.4,0,0.2,1), transform 0.65s cubic-bezier(0.4,0,0.2,1)'
            : 'none',
          zIndex: isActive ? 2 : isPrev ? 1 : 0,
        }}
      >
        {/* Arkaplan — gradient veya gerçek resim */}
        {isGradient ? (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{ background: slide.imageUrl || 'linear-gradient(135deg,#f8fafc,#e2e8f0)' }}
            />
            {/* Soft Light ambient glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,247,237,0.6) 0%, transparent 70%)',
            }} />
          </div>
        ) : (
          <img
            src={resolveUploadUrl(slide.imageUrl)}
            alt={slide.title || 'Slide'}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {hasContent && (
          <>
            {/* Subtle light/dark leak gradient instead of a heavy solid block */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: overlayGradient, mixBlendMode: blendMode as any }} />
            {/* Content positioned on left */}
            <div className={`absolute inset-0 flex items-center ${
              textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'
            }`}>
              <div
                key={isActive ? 'active' : 'inactive'}
                className={`flex flex-col text-left w-[55%] min-w-[320px] px-8 md:px-14 py-8 mx-4 md:mx-10 rounded-[2.5rem] backdrop-blur-xl border shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${
                  isLightText ? 'bg-black/35 border-white/10' : 'bg-white/40 border-white/60'
                } ${alignClass}`}
                style={{
                  opacity: 1,
                  transform: 'none',
                }}
              >
                {/* Removed Premium badge per user request */}
                {slide.title && (
                  <h1
                    className="text-3xl md:text-5xl font-black leading-[1.08] tracking-tight mb-3 animate-hero-text"
                    style={{ color: textColor }}
                  >
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p
                    className="text-sm md:text-base leading-relaxed mb-6 font-medium animate-hero-text delay-100"
                    style={{ color: textColor, opacity: 0.8 }}
                  >
                    {slide.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 animate-hero-text delay-200">
                  {slide.btnLeftText && (
                    <Link
                      href={slide.btnLeftLink || '#'}
                      className="px-6 py-3.5 rounded-2xl bg-[#9A3412] text-white font-bold text-[14px] tracking-wide hover:bg-[#C2410C] transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
                    >
                      {slide.btnLeftText}
                    </Link>
                  )}
                  {slide.btnRightText && (
                    <Link
                      href={slide.btnRightLink || '#'}
                      className="px-6 py-3.5 rounded-2xl bg-white border-2 border-orange-600 font-bold text-[14px] tracking-wide text-orange-800 hover:bg-orange-50 transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm"
                    >
                      {slide.btnRightText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full min-h-[420px] md:h-[540px] rounded-[2rem] overflow-hidden relative shadow-[0_8px_60px_rgba(0,0,0,0.12),0_2px_20px_rgba(0,0,0,0.08)] border border-slate-200/60 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slaytlar */}
      {display.map((slide, idx) =>
        renderSlideContent(
          slide,
          idx === current,
          idx === prev
        )
      )}

      {/* Ok butonları */}
      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/40 hover:scale-110 active:scale-95"
            aria-label="Önceki"
          >
            <ChevronLeft size={18} strokeWidth={2.5}/>
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/40 hover:scale-110 active:scale-95"
            aria-label="Sonraki"
          >
            <ChevronRight size={18} strokeWidth={2.5}/>
          </button>
        </>
      )}

      {/* Göstergeler */}
      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 items-center px-3 py-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/15">
          {display.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={idx === current ? 'rounded-full transition-all duration-400 w-7 h-2 bg-white' : 'rounded-full transition-all duration-400 w-2 h-2 bg-white/40 hover:bg-white/70'}
              aria-label={`Slayt ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {total > 1 && !paused && (
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10">
          <div
            key={current}
            className="h-full bg-white/60 rounded-full"
            style={{ animation: 'progress-bar 5s linear forwards' }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
