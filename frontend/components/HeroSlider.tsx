'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { subscribeBuilderPreview, getBuilderHeroSlides, getBuilderPreview } from '@/lib/builder-preview';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { API_BASE } from '@/lib/apiBase';

/* ─────────────────────────────────────────────────────────────────────────────
   KARBON hero
   Eski hero: açık zemin, cam kutu içinde metin, yuvarlak köşeler, gölge.
   Yeni hero: tam kanvas karbon sahne, görselin üstüne DOĞRUDAN devasa tipografi,
   mono slayt sayacı, hairline ilerleme çizgisi.

   Veri akışı ve admin builder önizlemesi bilinçli olarak AYNI bırakıldı —
   admin hero yöneticisi eskisi gibi çalışmaya devam eder.

   Not: eski sürüm slaytın DB'deki textColor'ına göre açık/koyu overlay
   hesaplıyordu; bu, koyu temada beyaz-üstüne-beyaz riski taşıyordu. Artık
   sahne her zaman koyu ve metin her zaman açık — kontrast garanti.
   ───────────────────────────────────────────────────────────────────────────── */

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
  imageUrl: 'linear-gradient(135deg, #0A0A0C 0%, #16161A 60%, #2B1A10 100%)',
  title: 'Doğrulanmış cihaz.\nSıfır risk.',
  subtitle:
    'Yüzlerce yetkili bayi aynı cihaz için yarışır. Sen en iyi fiyatı alırsın — ödemen teslimata kadar Escrow’da güvende kalır.',
  btnLeftText: 'Cihazları Keşfet',
  btnLeftLink: '/',
  btnRightText: 'Cihazını Sat',
  btnRightLink: '/sell',
  textAlignment: 'left',
};

const isCssBackground = (v?: string | null) =>
  !!v && (v.startsWith('linear-gradient') || v.startsWith('radial-gradient') || v.startsWith('#'));

export default function HeroSlider() {
  const [slides, setSlides]       = useState<Slide[]>([]);
  const [current, setCurrent]     = useState(0);
  const [prev, setPrev]           = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused]       = useState(false);
  const [, forceRender]           = useState(0);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => subscribeBuilderPreview(() => forceRender((n) => n + 1)), []);

  useEffect(() => {
    fetch(`${API_BASE}/hero-slides`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Slide[]) => { if (data.length > 0) setSlides(data); })
      .catch(() => {});
  }, []);

  const previewSlides   = getBuilderHeroSlides();
  const previewSettings = getBuilderPreview();

  const raw     = (previewSlides || slides).filter((s: Slide) => s.isActive !== false);
  const display = raw.length > 0 ? raw : [FALLBACK];
  const total   = display.length;

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current || total <= 1) return;
    setPrev(current);
    setCurrent(idx);
    setAnimating(true);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
  }, [animating, current, total]);

  const goNext = useCallback(() => goTo((current + 1) % total), [goTo, current, total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current = setInterval(goNext, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [goNext, total, paused]);

  // Hook sırası bozulmasın diye erken return TÜM hook'lardan sonra
  if (previewSettings?.showHeroSlider === false) return null;

  return (
    <section
      className="relative w-full overflow-hidden group"
      style={{
        minHeight: 'clamp(460px, 62vh, 620px)',
        background: 'var(--k-void)',
        borderTop: '1px solid var(--k-line)',
        borderBottom: '1px solid var(--k-line)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {display.map((slide, idx) => {
        const isActive = idx === current;
        const isPrev   = idx === prev;
        const gradient = isCssBackground(slide.imageUrl);

        return (
          <div
            key={slide.id}
            className="absolute inset-0"
            aria-hidden={!isActive}
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : isPrev ? 'scale(1.05)' : 'scale(1.02)',
              transition: isActive || isPrev
                ? 'opacity .7s cubic-bezier(.22,1,.36,1), transform 1.4s cubic-bezier(.22,1,.36,1)'
                : 'none',
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {/* Sahne zemini */}
            {gradient ? (
              <div className="absolute inset-0" style={{ background: slide.imageUrl }} />
            ) : (
              <img
                src={resolveUploadUrl(slide.imageUrl)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ opacity: 0.5 }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            {/* Karbon scrim — metnin okunabilirliğini garanti eder */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(6,6,7,0.96) 0%, rgba(6,6,7,0.80) 42%, rgba(6,6,7,0.35) 100%)',
              }}
            />
            {/* Nefes alan turuncu ışık */}
            <div
              className="k-breathe pointer-events-none absolute -right-[8%] top-1/2 h-[560px] w-[560px] -translate-y-1/2 rounded-full blur-[130px]"
              style={{ background: 'rgba(255,106,26,0.22)' }}
            />
          </div>
        );
      })}

      {/* Teknik ızgara */}
      <div className="k-grid-bg k-grid-fade pointer-events-none absolute inset-0 z-[3] opacity-70" />

      {/* ── İçerik ─────────────────────────────────────────────────────────── */}
      <div className="relative z-[4] mx-auto flex h-full max-w-[1440px] flex-col justify-center px-4 py-16 lg:px-8"
           style={{ minHeight: 'clamp(460px, 62vh, 620px)' }}>
        {display.map((slide, idx) => {
          if (idx !== current) return null;
          return (
            <div key={slide.id} className="max-w-[760px]">
              {/* Üst etiket */}
              <div className="mb-6 flex items-center gap-3">
                <span className="k-chip k-chip-hot">
                  <ShieldCheck size={11} strokeWidth={2.5} />
                  Doğrulanmış Pazaryeri
                </span>
                <span className="k-label hidden sm:block">32 Noktada Test · Escrow Korumalı</span>
              </div>

              {slide.title && (
                <h1
                  className="k-display animate-hero-text whitespace-pre-line"
                  style={{ fontSize: 'clamp(2.6rem, 6.4vw, 5.2rem)' }}
                >
                  {slide.title}
                </h1>
              )}

              {slide.subtitle && (
                <p
                  className="animate-hero-text delay-100 mt-6 max-w-[560px] text-[15px] leading-relaxed md:text-[17px]"
                  style={{ color: 'var(--k-ink-2)' }}
                >
                  {slide.subtitle}
                </p>
              )}

              <div className="animate-hero-text delay-200 mt-9 flex flex-wrap items-center gap-3">
                {slide.btnLeftText && (
                  <Link href={slide.btnLeftLink || '#'} className="k-btn k-btn-hot">
                    {slide.btnLeftText}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </Link>
                )}
                {slide.btnRightText && (
                  <Link href={slide.btnRightLink || '#'} className="k-btn k-btn-ghost">
                    {slide.btnRightText}
                  </Link>
                )}
              </div>

              {/* Güven okumaları */}
              <div
                className="animate-hero-text delay-300 mt-12 grid max-w-[560px] grid-cols-2 gap-px sm:grid-cols-4"
                style={{ background: 'var(--k-line)', border: '1px solid var(--k-line)' }}
              >
                {[
                  { v: '150+',  l: 'Aktif Bayi' },
                  { v: '32',    l: 'Test Noktası' },
                  { v: '6 Ay',  l: 'Garanti' },
                  { v: '%100',  l: 'Escrow' },
                ].map((s) => (
                  <div key={s.l} className="px-3 py-3" style={{ background: 'rgba(6,6,7,0.72)' }}>
                    <div className="k-mono text-[18px] font-bold leading-none" style={{ color: 'var(--k-hot)' }}>
                      {s.v}
                    </div>
                    <div className="k-label mt-1.5" style={{ fontSize: 9 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Slayt sayacı (mono) ────────────────────────────────────────────── */}
      {total > 1 && (
        <div className="absolute bottom-7 right-4 z-[5] flex items-center gap-4 lg:right-8">
          <span className="k-mono text-[11px] tracking-widest" style={{ color: 'var(--k-ink-3)' }}>
            {String(current + 1).padStart(2, '0')}
            <span style={{ color: 'var(--k-ink-4)' }}> / {String(total).padStart(2, '0')}</span>
          </span>
          <div className="flex gap-1.5">
            {display.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Slayt ${idx + 1}`}
                className="h-[3px] transition-all duration-300"
                style={{
                  width: idx === current ? 28 : 14,
                  background: idx === current ? 'var(--k-hot)' : 'var(--k-line-2)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* İlerleme çizgisi */}
      {total > 1 && !paused && (
        <div className="absolute bottom-0 left-0 right-0 z-[5] h-[2px]">
          <div
            key={current}
            className="h-full"
            style={{ background: 'var(--k-hot)', animation: 'k-progress 6s linear forwards' }}
          />
        </div>
      )}

      <style>{`@keyframes k-progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}
