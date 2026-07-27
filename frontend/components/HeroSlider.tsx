'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { subscribeBuilderPreview, getBuilderHeroSlides, getBuilderPreview } from '@/lib/builder-preview';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { API_BASE } from '@/lib/apiBase';

/* ─────────────────────────────────────────────────────────────────────────────
   ATÖLYE hero — bölünmüş editoryal düzen

   KARBON'da hero tam kanvas koyu bir sahneydi ve metin görselin üstünde,
   koyu bir scrim'in korumasıyla duruyordu. Açık temada scrim mantığı çöker:
   krem zemine krem scrim koymak metni kurtarmaz.

   Bu yüzden düzen değişti — metin ve görsel artık ÜST ÜSTE değil, YAN YANA:
   solda tipografi (krem zeminde koyu mürekkep, kontrast garantili), sağda
   ürün görseli kendi yumuşak sahnesinde. Kontrast artık görselin ne kadar
   karanlık olduğuna bağlı değil.

   Veri akışı ve admin builder önizlemesi bilinçli olarak korundu.
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
  imageUrl: '',
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

const TRUST = [
  { v: '150+', l: 'Aktif Bayi' },
  { v: '32',   l: 'Test Noktası' },
  { v: '6 Ay', l: 'Garanti' },
  { v: '%100', l: 'Escrow' },
];

export default function HeroSlider() {
  const [slides, setSlides]       = useState<Slide[]>([]);
  const [current, setCurrent]     = useState(0);
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
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => setAnimating(false), 700);
  }, [animating, current, total]);

  const goNext = useCallback(() => goTo((current + 1) % total), [goTo, current, total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    timerRef.current = setInterval(goNext, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [goNext, total, paused]);

  // Erken return TÜM hook'lardan sonra — hook sırası bozulmasın
  if (previewSettings?.showHeroSlider === false) return null;

  const slide    = display[Math.min(current, total - 1)];
  const gradient = isCssBackground(slide.imageUrl);
  const hasImage = !!slide.imageUrl;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: 'var(--k-canvas)', borderBottom: '1px solid var(--k-line)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Çok hafif teknik ızgara — üstte belirir, aşağı doğru söner */}
      <div className="k-grid-bg k-grid-fade pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">

        {/* ── Sol: tipografi ─────────────────────────────────────────────── */}
        <div key={`copy-${slide.id}`} className="max-w-[600px]">
          <div className="mb-7 flex flex-wrap items-center gap-3 animate-hero-text">
            <span className="k-chip k-chip-hot">
              <ShieldCheck size={11} strokeWidth={2.5} />
              Doğrulanmış Pazaryeri
            </span>
            <span className="k-label">32 Noktada Test · Escrow Korumalı</span>
          </div>

          {slide.title && (
            <h1
              className="k-display animate-hero-text whitespace-pre-line"
              style={{ fontSize: 'clamp(2.5rem, 5.6vw, 4.6rem)', lineHeight: 1.02 }}
            >
              {slide.title}
            </h1>
          )}

          {slide.subtitle && (
            <p
              className="animate-hero-text delay-100 mt-7 max-w-[520px] text-[15.5px] leading-[1.75] md:text-[17px]"
              style={{ color: 'var(--k-ink-2)' }}
            >
              {slide.subtitle}
            </p>
          )}

          <div className="animate-hero-text delay-200 mt-10 flex flex-wrap items-center gap-3">
            {slide.btnLeftText && (
              <Link href={slide.btnLeftLink || '#'} className="k-btn k-btn-hot">
                {slide.btnLeftText}
                <ArrowRight size={16} strokeWidth={2.2} />
              </Link>
            )}
            {slide.btnRightText && (
              <Link href={slide.btnRightLink || '#'} className="k-btn k-btn-ghost">
                {slide.btnRightText}
              </Link>
            )}
          </div>

          {/* Güven okumaları — hairline ile bölünmüş, kutu değil */}
          <div
            className="animate-hero-text delay-300 mt-14 grid max-w-[540px] grid-cols-2 sm:grid-cols-4"
            style={{ borderTop: '1px solid var(--k-line)' }}
          >
            {TRUST.map((s, i) => (
              <div
                key={s.l}
                className="py-5 pr-4"
                style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--k-line)', paddingLeft: i === 0 ? 0 : 18 }}
              >
                <div className="k-price text-[24px] leading-none" style={{ color: 'var(--k-hot)' }}>
                  {s.v}
                </div>
                <div className="k-label mt-2" style={{ fontSize: 9 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sağ: ürün sahnesi ──────────────────────────────────────────── */}
        <div className="relative">
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 'var(--k-r-xl)',
              border: '1px solid var(--k-line)',
              background: 'linear-gradient(160deg, #FFFFFF 0%, var(--k-canvas-2) 62%, #F6EDE4 100%)',
              aspectRatio: '4 / 3.4',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Yumuşak şeftali halesi — cihazı sahneden ayırır */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[64px]"
              style={{ background: 'rgba(194,65,12,0.11)' }}
            />

            {hasImage && !gradient && (
              <img
                key={`img-${slide.id}`}
                src={resolveUploadUrl(slide.imageUrl)}
                alt={slide.title || ''}
                className="k-drift absolute inset-0 h-full w-full object-contain"
                style={{ padding: '9%' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {gradient && (
              <div className="absolute inset-0" style={{ background: slide.imageUrl, opacity: 0.5 }} />
            )}

            {/* Sahne köşe etiketi */}
            <div className="absolute left-5 top-5">
              <span className="k-label">Doğrulanmış Cihaz</span>
            </div>
          </div>

          {/* Slayt sayacı — sahnenin altında, editoryal */}
          {total > 1 && (
            <div className="mt-6 flex items-center gap-5">
              <span className="k-mono text-[11px] tracking-widest" style={{ color: 'var(--k-ink-3)' }}>
                {String(current + 1).padStart(2, '0')}
                <span style={{ color: 'var(--k-ink-4)' }}> / {String(total).padStart(2, '0')}</span>
              </span>
              <div className="flex flex-1 gap-1.5">
                {display.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    aria-label={`Slayt ${idx + 1}`}
                    className="h-[2px] flex-1 transition-all duration-500"
                    style={{ background: idx === current ? 'var(--k-hot)' : 'var(--k-line-2)' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
