'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, ShieldCheck, BatteryCharging, Cpu, Heart,
  Smartphone, RefreshCcw, BadgeCheck,
} from 'lucide-react';
import { subscribeBuilderPreview, getBuilderHeroSlides, getBuilderPreview } from '@/lib/builder-preview';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { API_BASE } from '@/lib/apiBase';

/* ─────────────────────────────────────────────────────────────────────────────
   IZGARA hero — "çizim masası" konsepti

   Beyaz zemin üzerine ince kareli ızgara, üzerine merkeze ve sağ üste süzülen
   mor/mavi radyal ışıma, ızgaranın üstünde havada duran mikro ikon kartları.
   Ana mesaj tam merkeze oturur; negatif alan bilinçli olarak geniş bırakılır.

   Veri akışı ve admin builder önizlemesi korundu — hero yöneticisi aynen çalışır.
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
  title: 'Cihazını En Yüksek Fiyata Sat,\nYenisini Sıfır Riskle Al.',
  subtitle:
    'Yetkili bayilerin yarıştığı kapalı teklif sistemiyle cihazını 1 saatte en yüksek fiyata sat. Ya da 12 ay garantili, 32 noktada test edilmiş cihazları Escrow güvencesiyle satın al.',
  btnLeftText: 'Cihazını Hemen Sat',
  btnLeftLink: '/sell',
  btnRightText: 'Garantili Cihazları İncele',
  btnRightLink: '/',
  textAlignment: 'center',
};

/* Izgaranın üstünde süzülen mikro kartlar. */
const FLOATERS = [
  { Icon: Cpu,             color: '#3B82F6', bg: '#EFF6FF', top: '14%',  left: '6%',   size: 54, delay: '0s',   rot: '-8deg' },
  { Icon: BatteryCharging, color: '#10B981', bg: '#ECFDF5', top: '60%',  left: '5%',   size: 48, delay: '1.4s', rot: '6deg'  },
  { Icon: ShieldCheck,     color: '#6366F1', bg: '#EEF2FF', top: '22%',  right: '7%',  size: 58, delay: '0.7s', rot: '7deg'  },
  { Icon: Heart,           color: '#EC4899', bg: '#FDF2F8', top: '66%',  right: '5%',  size: 46, delay: '2.1s', rot: '-6deg' },
  { Icon: Smartphone,      color: '#F59E0B', bg: '#FFFBEB', top: '76%',  left: '16%',  size: 50, delay: '1.0s', rot: '9deg'  },
  { Icon: RefreshCcw,      color: '#3B82F6', bg: '#EFF6FF', top: '12%',  right: '20%', size: 44, delay: '2.6s', rot: '-10deg'},
];

const TRUST = [
  { v: '150+',  l: 'Onaylı Yetkili Bayi' },
  { v: '32',    l: 'Noktada Detaylı Test' },
  { v: '12 Ay', l: 'Tam Kapsam Garanti' },
  { v: '%100',  l: 'Escrow Güvenli Ödeme' },
];

const isCssBackground = (v?: string | null) =>
  !!v && (v.startsWith('linear-gradient') || v.startsWith('radial-gradient') || v.startsWith('#'));

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
    setTimeout(() => setAnimating(false), 650);
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
  const hasImage = !!slide.imageUrl && !isCssBackground(slide.imageUrl);

  return (
    <section
      className="k-glow-wrap relative w-full overflow-hidden"
      style={{ background: 'var(--k-canvas)', borderBottom: '1px solid var(--k-line)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Izgara dokusu: tasarımın karakteristik kimliği ─────────────────── */}
      <div className="k-grid-fine k-grid-fade pointer-events-none absolute inset-0" />

      {/* ── Yüzen mikro kartlar ────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        {FLOATERS.map((f, i) => {
          const { Icon } = f;
          return (
            <div
              key={i}
              className="k-float k-floaty absolute"
              style={{
                top: f.top, left: f.left, right: f.right,
                width: f.size, height: f.size,
                animationDelay: f.delay,
                ['--k-rot' as any]: f.rot,
              }}
            >
              <div
                className="flex items-center justify-center rounded-[9px]"
                style={{ width: f.size * 0.56, height: f.size * 0.56, background: f.bg }}
              >
                <Icon size={Math.round(f.size * 0.3)} strokeWidth={2.2} style={{ color: f.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Merkezi mesaj ──────────────────────────────────────────────────── */}
      <div className="relative mx-auto flex max-w-[1020px] flex-col items-center px-4 py-20 text-center lg:py-28">

        {/* Canlı Güvence Rozeti */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-extrabold tracking-wide mb-6 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <BadgeCheck size={15} strokeWidth={2.4} className="text-indigo-600" />
          <span>TSE Onaylı Yenileme Merkezi · 32 Noktada Test · %100 Escrow Güvencesi</span>
        </div>

        {slide.title && (
          <h1
            className="k-display whitespace-pre-line text-slate-900 font-extrabold tracking-tight"
            style={{ fontSize: 'clamp(2.8rem, 6.2vw, 5.2rem)', maxWidth: '16ch', color: '#0F172A' }}
          >
            {slide.title}
          </h1>
        )}

        {slide.subtitle && (
          <p
            className="mt-6 max-w-[680px] text-[16px] leading-[1.8] md:text-[19px] font-medium text-slate-700"
          >
            {slide.subtitle}
          </p>
        )}

        {/* Aksiyon Butonları & Hızlı Kısayol */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {slide.btnLeftText && (
            <Link
              href={slide.btnLeftLink || '#'}
              className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[15px] shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-2.5 hover:-translate-y-0.5"
            >
              {slide.btnLeftText}
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          )}
          {slide.btnRightText && (
            <Link
              href={slide.btnRightLink || '#'}
              className="px-7 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-[15px] border border-slate-200 shadow-sm hover:shadow transition-all hover:-translate-y-0.5"
            >
              {slide.btnRightText}
            </Link>
          )}
          <Link
            href="/ai-finder"
            className="px-6 py-4 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[14px] border border-emerald-200/80 transition-all flex items-center gap-2"
          >
            <span>✦ Yapay Zekâ ile Telefon Bul</span>
          </Link>
        </div>

        {/* ── Ürün sahnesi: varsa slayt görseli, havada süzülen kart ─────── */}
        {hasImage && (
          <div
            className="relative mt-16 w-full max-w-[620px] overflow-hidden"
            style={{
              borderRadius: 'var(--k-r-xl)',
              border: '1px solid var(--k-line)',
              background: 'linear-gradient(160deg, #FFFFFF 0%, #F8FAFF 60%, #EEF2FF 100%)',
              boxShadow: 'var(--shadow-xl)',
              aspectRatio: '16 / 9',
            }}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
              style={{ background: 'rgba(91,101,246,0.16)' }}
            />
            <img
              key={slide.id}
              src={resolveUploadUrl(slide.imageUrl)}
              alt={slide.title || ''}
              className="k-drift absolute inset-0 h-full w-full object-contain"
              style={{ padding: '5%' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* ── Güven okumaları ─────────────────────────────────────────────── */}
        <div className="mt-16 grid w-full max-w-[720px] grid-cols-2 gap-px sm:grid-cols-4"
             style={{ background: 'var(--k-line)', border: '1px solid var(--k-line)', borderRadius: 'var(--k-r)' }}>
          {TRUST.map((s) => (
            <div key={s.l} className="px-4 py-5" style={{ background: 'var(--k-surface)' }}>
              <div className="k-price text-[26px] leading-none">
                <span className="k-grad-text">{s.v}</span>
              </div>
              <div className="k-label mt-2">{s.l}</div>
            </div>
          ))}
        </div>

        {/* ── Slayt göstergesi ────────────────────────────────────────────── */}
        {total > 1 && (
          <div className="mt-12 flex items-center gap-2">
            {display.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Slayt ${idx + 1}`}
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: idx === current ? 30 : 8,
                  background: idx === current ? 'var(--k-grad)' : 'var(--k-line-2)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
