'use client';
import Link from 'next/link';
import { Battery, Smartphone, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import type { FamilySummary } from '@/lib/hooks/useProducts';

/* ─────────────────────────────────────────────────────────────────────────────
   ATÖLYE ürün kartı

   Beyaz kart, krem görsel sahnesi, editoryal serif model adı ve fiyat.
   Durağan halde neredeyse gölgesiz (yalnız hairline) — derinlik HOVER'da
   doğar: kart 4px yükselir, sıcak gölge derinleşir, görsel hafifçe büyür.
   "Sakin ama canlı" dengesini kuran mekanizma bu.
   ───────────────────────────────────────────────────────────────────────────── */

const GRADE: Record<string, { label: string; hot?: boolean }> = {
  'A+': { label: 'Kusursuz', hot: true },
  'A':  { label: 'Çok İyi' },
  'B':  { label: 'İyi' },
  'C':  { label: 'İdare Eder' },
};

/** Markaya özgü sahne halesi — krem zeminde cihazı öne çeker */
const BRAND_AURA: Record<string, string> = {
  Apple:   'rgba(28,21,18,0.06)',
  Samsung: 'rgba(46,92,138,0.10)',
  Xiaomi:  'rgba(194,65,12,0.10)',
  Redmi:   'rgba(180,36,31,0.09)',
  POCO:    'rgba(180,83,9,0.10)',
  Huawei:  'rgba(180,36,31,0.09)',
  Vivo:    'rgba(70,70,150,0.09)',
  Realme:  'rgba(212,80,30,0.10)',
  Tecno:   'rgba(47,125,91,0.09)',
  Infinix: 'rgba(47,125,91,0.09)',
  Aksesuarlar: 'rgba(194,65,12,0.09)',
};
const DEFAULT_AURA = 'rgba(28,21,18,0.05)';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

interface Props {
  family: FamilySummary;
  index: number;
}

export default function FamilyCard({ family, index }: Props) {
  const gradeCfg = GRADE[family.bestGrade] ?? null;
  const aura     = BRAND_AURA[family.brand] ?? DEFAULT_AURA;
  const imgSrc   = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;
  const isRange  = family.minPrice !== family.maxPrice;
  const href     = `/urun/${encodeURIComponent(family.brand)}/${encodeURIComponent(family.model)}`;

  return (
    <Link
      href={href}
      className="k-card group flex h-full flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* ── Görsel sahnesi ───────────────────────────────────────────────── */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          aspectRatio: '4 / 5',
          background: 'linear-gradient(165deg, #FFFFFF 0%, var(--k-canvas-2) 100%)',
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-[68%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[42px] transition-transform duration-700 group-hover:scale-110"
          style={{ background: aura }}
        />

        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${family.brand} ${family.model}`}
            loading="lazy"
            className="relative z-[1] h-full w-full object-contain transition-transform duration-[800ms] ease-out group-hover:scale-[1.05]"
            style={{ padding: '11% 9%' }}
          />
        ) : (
          <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center gap-3 select-none">
            <Smartphone size={40} strokeWidth={1.25} style={{ color: 'var(--k-ink-4)' }} />
            <span className="k-label">{family.brand}</span>
          </div>
        )}

        {/* Üst şerit */}
        <div className="absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-2 p-3">
          {gradeCfg ? (
            <span className={gradeCfg.hot ? 'k-chip k-chip-hot' : 'k-chip'}>
              <ShieldCheck size={11} strokeWidth={2.5} />
              {family.bestGrade}
            </span>
          ) : <span />}

          {family.offerCount > 1 && (
            <span
              className="k-mono rounded-[6px] px-2 py-1 text-[10px] tracking-wider"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid var(--k-line)',
                color: 'var(--k-ink-3)',
              }}
            >
              {family.offerCount} TEKLİF
            </span>
          )}
        </div>

        {/* Pil sağlığı okuması */}
        {family.batteryMax !== null && (
          <div className="absolute bottom-3 left-3 z-[2]">
            <span
              className="k-mono inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[10px]"
              style={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid var(--k-line)',
                color: 'var(--k-ink-2)',
              }}
            >
              <Battery size={11} strokeWidth={2.5} style={{ color: 'var(--k-ok)' }} />
              {family.batteryMin === family.batteryMax
                ? `%${family.batteryMax}`
                : `%${family.batteryMin}–${family.batteryMax}`}
            </span>
          </div>
        )}
      </div>

      {/* ── Künye ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2.5 p-5" style={{ borderTop: '1px solid var(--k-line)' }}>
        <span className="k-label">{family.brand}</span>

        <h3 className="k-display text-[19px] leading-[1.2] line-clamp-2">
          {family.model}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {family.storageOptions.length > 0 && (
            <span
              className="k-mono rounded-[4px] px-1.5 py-0.5 text-[10px]"
              style={{ background: 'var(--k-canvas-2)', color: 'var(--k-ink-3)' }}
            >
              {family.storageOptions.length > 1
                ? `${family.storageOptions[0]}–${family.storageOptions[family.storageOptions.length - 1]}`
                : family.storageOptions[0]}
            </span>
          )}
          {family.hasWarrantyOffer && (
            <span
              className="k-mono rounded-[4px] px-1.5 py-0.5 text-[10px]"
              style={{ background: 'rgba(47,125,91,0.10)', color: 'var(--k-ok)' }}
            >
              GARANTİLİ
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* ── Fiyat + eylem ──────────────────────────────────────────────── */}
        <div
          className="mt-3 flex items-end justify-between gap-3 pt-4"
          style={{ borderTop: '1px solid var(--k-line)' }}
        >
          <div className="min-w-0">
            <span className="k-label mb-1.5 block">
              {isRange ? 'Başlangıç' : 'Net Fiyat'}
            </span>
            <span className="k-price block text-[22px] leading-none">
              {fmt(family.minPrice)}
              <span className="ml-1 text-[15px]" style={{ color: 'var(--k-hot)' }}>₺</span>
            </span>
          </div>

          <span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[9px] transition-all duration-300 group-hover:w-auto group-hover:px-3.5"
            style={{ background: 'var(--k-hot-wash)', border: '1px solid var(--k-line-hot)' }}
          >
            <span
              className="k-mono hidden whitespace-nowrap text-[10px] tracking-wider group-hover:inline"
              style={{ color: 'var(--k-hot)' }}
            >
              {family.offerCount > 1 ? 'KARŞILAŞTIR' : 'İNCELE'}
            </span>
            <ArrowUpRight
              size={16}
              strokeWidth={2.2}
              className="flex-shrink-0 transition-transform duration-300 group-hover:ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: 'var(--k-hot)' }}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function FamilyCardSkeleton() {
  return (
    <div className="k-card overflow-hidden">
      <div className="k-skeleton" style={{ aspectRatio: '4 / 5' }} />
      <div className="flex flex-col gap-3 p-5" style={{ borderTop: '1px solid var(--k-line)' }}>
        <div className="k-skeleton h-2 w-14 rounded-[4px]" />
        <div className="k-skeleton h-5 w-3/4 rounded-[4px]" />
        <div className="k-skeleton h-3 w-1/3 rounded-[4px]" />
        <div className="mt-3 flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--k-line)' }}>
          <div className="k-skeleton h-7 w-24 rounded-[4px]" />
          <div className="k-skeleton h-10 w-10 rounded-[9px]" />
        </div>
      </div>
    </div>
  );
}
