'use client';
import Link from 'next/link';
import { Battery, Smartphone, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import type { FamilySummary } from '@/lib/hooks/useProducts';

/* ─────────────────────────────────────────────────────────────────────────────
   KARBON ürün kartı
   Eski kart: beyaz zemin, 26px yumuşak köşe, gölge, serif başlık.
   Yeni kart: karbon yüzey, hairline kenar, teknik mono okumalar, hover'da
   turuncu kenar ışıması. Gölge yok — derinlik ışıkla veriliyor.
   ───────────────────────────────────────────────────────────────────────────── */

const GRADE: Record<string, { label: string; hot?: boolean }> = {
  'A+': { label: 'Kusursuz', hot: true },
  'A':  { label: 'Çok İyi' },
  'B':  { label: 'İyi' },
  'C':  { label: 'İdare Eder' },
};

/** Marka başına arka plan ışığı — ürün görselini zeminden ayırır */
const BRAND_AURA: Record<string, string> = {
  Apple:   'rgba(255,255,255,0.14)',
  Samsung: 'rgba(91,157,255,0.16)',
  Xiaomi:  'rgba(255,106,26,0.16)',
  Redmi:   'rgba(255,92,92,0.14)',
  POCO:    'rgba(255,197,61,0.14)',
  Huawei:  'rgba(255,92,92,0.14)',
  Vivo:    'rgba(120,120,255,0.14)',
  Realme:  'rgba(255,138,71,0.14)',
  Tecno:   'rgba(61,220,151,0.12)',
  Infinix: 'rgba(61,220,151,0.12)',
  Aksesuarlar: 'rgba(255,106,26,0.12)',
};
const DEFAULT_AURA = 'rgba(255,255,255,0.10)';

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
      className="k-card k-card-glow group h-full flex flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 30, 240)}ms` }}
    >
      {/* ── Görsel sahnesi ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: '4 / 5', background: 'var(--k-void)' }}
      >
        {/* Arka ışık — cihazı karanlıktan çeker */}
        <div
          className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[46px] transition-all duration-700 group-hover:scale-125"
          style={{ background: aura }}
        />

        {/* İnce teknik ızgara */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`${family.brand} ${family.model}`}
            loading="lazy"
            className="relative z-[1] h-full w-full object-contain transition-transform duration-[700ms] ease-out group-hover:scale-[1.07]"
            style={{ padding: '11% 9%' }}
          />
        ) : (
          <div className="relative z-[1] flex h-full w-full flex-col items-center justify-center gap-3 select-none">
            <Smartphone size={40} strokeWidth={1.25} style={{ color: 'var(--k-ink-4)' }} />
            <span className="k-label">{family.brand}</span>
          </div>
        )}

        {/* Üst şerit: kalite + teklif sayısı */}
        <div className="absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-2 p-3">
          {gradeCfg ? (
            <span className={gradeCfg.hot ? 'k-chip k-chip-hot' : 'k-chip'}>
              <ShieldCheck size={11} strokeWidth={2.5} />
              {family.bestGrade}
            </span>
          ) : <span />}

          {family.offerCount > 1 && (
            <span
              className="k-mono rounded-[6px] px-2 py-1 text-[10px] font-medium tracking-wider"
              style={{
                background: 'rgba(6,6,7,0.72)',
                border: '1px solid var(--k-line-2)',
                color: 'var(--k-ink-2)',
                backdropFilter: 'blur(6px)',
              }}
            >
              {family.offerCount} TEKLİF
            </span>
          )}
        </div>

        {/* Alt şerit: pil sağlığı okuması */}
        {family.batteryMax !== null && (
          <div className="absolute bottom-3 left-3 z-[2]">
            <span
              className="k-mono inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[10px]"
              style={{
                background: 'rgba(6,6,7,0.72)',
                border: '1px solid var(--k-line-2)',
                color: 'var(--k-ink-2)',
                backdropFilter: 'blur(6px)',
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
      <div className="flex flex-1 flex-col gap-2 p-4" style={{ borderTop: '1px solid var(--k-line)' }}>
        <span className="k-label">{family.brand}</span>

        <h3
          className="k-display text-[17px] leading-[1.15] line-clamp-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          {family.model}
        </h3>

        {/* Varyant okumaları */}
        <div className="flex flex-wrap items-center gap-1.5">
          {family.storageOptions.length > 0 && (
            <span
              className="k-mono rounded-[4px] px-1.5 py-0.5 text-[10px]"
              style={{ background: 'var(--k-surface-3)', color: 'var(--k-ink-3)' }}
            >
              {family.storageOptions.length > 1
                ? `${family.storageOptions[0]}–${family.storageOptions[family.storageOptions.length - 1]}`
                : family.storageOptions[0]}
            </span>
          )}
          {family.hasWarrantyOffer && (
            <span
              className="k-mono rounded-[4px] px-1.5 py-0.5 text-[10px]"
              style={{ background: 'rgba(61,220,151,0.10)', color: 'var(--k-ok)' }}
            >
              GARANTİLİ
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* ── Fiyat okuması + eylem ──────────────────────────────────────── */}
        <div
          className="mt-2 flex items-end justify-between gap-3 pt-3"
          style={{ borderTop: '1px solid var(--k-line)' }}
        >
          <div className="min-w-0">
            <span className="k-label block mb-1">
              {isRange ? 'Başlangıç' : 'Net Fiyat'}
            </span>
            <span className="k-mono block text-[19px] font-bold leading-none" style={{ color: 'var(--k-ink)' }}>
              {fmt(family.minPrice)}
              <span className="ml-1 text-[13px]" style={{ color: 'var(--k-hot)' }}>₺</span>
            </span>
          </div>

          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] transition-all duration-300 group-hover:w-auto group-hover:px-3"
            style={{ background: 'var(--k-surface-3)', border: '1px solid var(--k-line-2)' }}
          >
            <span className="k-mono hidden whitespace-nowrap text-[10px] tracking-wider group-hover:inline" style={{ color: 'var(--k-hot)' }}>
              {family.offerCount > 1 ? 'KARŞILAŞTIR' : 'İNCELE'}
            </span>
            <ArrowUpRight
              size={15}
              strokeWidth={2.5}
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
      <div className="flex flex-col gap-3 p-4" style={{ borderTop: '1px solid var(--k-line)' }}>
        <div className="k-skeleton h-2 w-14 rounded-[4px]" />
        <div className="k-skeleton h-4 w-3/4 rounded-[4px]" />
        <div className="k-skeleton h-3 w-1/3 rounded-[4px]" />
        <div className="mt-2 flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--k-line)' }}>
          <div className="k-skeleton h-6 w-24 rounded-[4px]" />
          <div className="k-skeleton h-9 w-9 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
