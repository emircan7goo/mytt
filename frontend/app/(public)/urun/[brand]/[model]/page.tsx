'use client';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Box, ShieldCheck, Battery, Smartphone,
  ChevronRight, Crown, Layers, Wallet, Gauge,
} from 'lucide-react';
import { useProductFamily, type ComparisonSort } from '@/lib/hooks/useProducts';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import DealerTrustBadge from '@/components/DealerTrustBadge';

const GRADE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'A+': { label: 'Kusursuz',         color: "var(--k-hot)", bg: '#FFF7ED', border: '#FED7AA' },
  'A':  { label: 'Çok İyi',          color: '#0369A1', bg: '#EFF6FF', border: '#BAE6FD' },
  'B':  { label: 'İyi',              color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  'C':  { label: 'Kabul Edilebilir', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const SORT_OPTIONS: { value: ComparisonSort; label: string; hint: string }[] = [
  { value: 'price_asc',      label: 'Fiyata Göre',  hint: 'En uygundan başla' },
  { value: 'best_condition', label: 'Duruma Göre',  hint: 'Fiyat önemli değil' },
];

export default function ProductFamilyPage() {
  const params = useParams();
  const router = useRouter();
  const brand = decodeURIComponent((params?.brand as string) ?? '');
  const model = decodeURIComponent((params?.model as string) ?? '');

  const [sort, setSort]       = useState<ComparisonSort>('price_asc');
  const [storage, setStorage] = useState<string | null>(null);

  const { data: family, isLoading, isError } = useProductFamily(brand, model, {
    sort,
    storage: storage ?? undefined,
  });

  const cheapest = useMemo(
    () => (family?.items.length ? Math.min(...family.items.map((o) => Number(o.price))) : 0),
    [family],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--k-canvas)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--k-line)] border-t-orange-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !family) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--k-surface-2)]">
        <h1 className="font-editorial italic text-[var(--k-ink)] text-[44px] mb-4">Teklif bulunamadı.</h1>
        <p className="text-[var(--k-ink-3)] text-[15px] font-light max-w-sm text-center mb-8">
          {brand} {model} için şu anda aktif bir bayi teklifi yok.
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-8 py-3.5 text-sm tracking-widest uppercase font-bold text-[var(--k-ink)] bg-[var(--k-canvas)] rounded-full hover:bg-[var(--k-void)] transition-colors"
        >
          Vitrine Dön
        </button>
      </div>
    );
  }

  const heroImage = family.masterImages?.[0] ? resolveUploadUrl(family.masterImages[0]) : null;

  return (
    <div className="min-h-screen bg-[var(--k-surface-2)]">
      {/* ══════════════════════════ HERO — Karanlık, Editoryal ══════════════════════════ */}
      <div className="relative overflow-hidden bg-[var(--k-canvas)] pt-[100px] md:pt-[132px] pb-20 md:pb-28">
        {/* Ambiyans ışıması */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 900px 500px at 12% -10%, rgba(194,65,12,0.10), transparent 60%),' +
              'radial-gradient(ellipse 700px 500px at 100% 20%, rgba(212,80,30,0.06), transparent 55%)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-[var(--k-ink-3)] hover:text-[var(--k-ink)] transition-colors mb-10 md:mb-14"
          >
            <div className="w-9 h-9 rounded-full border border-[var(--k-line-2)] flex items-center justify-center group-hover:border-[var(--k-hot)] transition-colors">
              <ArrowLeft size={15} strokeWidth={1.5} />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Vitrine Dön</span>
          </button>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-end">
            {/* Görsel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-[180px] h-[220px] md:w-[220px] md:h-[270px] shrink-0 rounded-[32px] bg-[var(--k-surface)]/[0.04] border border-[var(--k-line)] backdrop-blur-sm flex items-center justify-center overflow-hidden"
            >
              {heroImage ? (
                <img src={heroImage} alt={model} className="w-4/5 h-4/5 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
              ) : (
                <Smartphone size={64} className="text-[var(--k-ink)]/10" strokeWidth={1} />
              )}
            </motion.div>

            {/* Başlık + istatistikler */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <span className="text-[11px] font-bold text-[var(--k-hot)] uppercase tracking-[0.2em] bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)] px-3 py-1.5 rounded-full">
                  {family.brand}
                </span>
                <span className="text-[11px] font-bold text-[var(--k-ink-3)] uppercase tracking-[0.2em] bg-[var(--k-surface)]/[0.06] border border-[var(--k-line)] px-3 py-1.5 rounded-full">
                  {family.offerCount} Doğrulanmış Teklif
                </span>
              </div>

              <h1 className="font-editorial text-[var(--k-ink)] text-[52px] md:text-[76px] leading-[0.98] tracking-tight mb-8">
                {family.model}
              </h1>

              {/* Aralık Şeridi — spec-sheet hissi */}
              <div className="inline-flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-5 border-t border-[var(--k-line)] pt-6">
                {family.storageOptions.length > 0 && (
                  <StatBlock
                    icon={<Layers size={13} />}
                    label="Depolama"
                    value={
                      family.storageOptions.length > 1
                        ? `${family.storageOptions[0]} – ${family.storageOptions[family.storageOptions.length - 1]}`
                        : family.storageOptions[0]
                    }
                  />
                )}
                {family.batteryRange && (
                  <StatBlock
                    icon={<Gauge size={13} />}
                    label="Pil Sağlığı"
                    value={
                      family.batteryRange.min === family.batteryRange.max
                        ? `%${family.batteryRange.min}`
                        : `%${family.batteryRange.min} – %${family.batteryRange.max}`
                    }
                  />
                )}
                <StatBlock
                  icon={<Wallet size={13} />}
                  label="Fiyat Aralığı"
                  value={
                    family.priceRange.min === family.priceRange.max
                      ? fmt(family.priceRange.min)
                      : `${fmt(family.priceRange.min)} – ${fmt(family.priceRange.max)}`
                  }
                  accent
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════ İÇERİK — Açık, Sakin ══════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 -mt-10 md:-mt-12 relative z-20 pb-24">
        <p className="text-center text-[13px] text-[var(--k-ink-3)] max-w-xl mx-auto mb-8 leading-relaxed">
          {family.offerCount > 1
            ? 'Bu modeli birden fazla doğrulanmış satıcı listeledi. Kimlikleri hiçbir zaman paylaşılmaz —'
            : 'Bu modeli doğrulanmış bir satıcı listeledi. Kimliği hiçbir zaman paylaşılmaz —'}{' '}
          siz sadece durumu ve fiyatı karşılaştırırsınız, <span className="font-semibold text-[var(--k-ink-2)]">Mytt güvencesiyle</span> satın alırsınız.
        </p>

        {/* Filtre / Sıralama Çubuğu — tek teklifte gösterilecek bir şey yok */}
        {family.offerCount > 1 && (
          <div className="sticky top-[76px] z-30 bg-[rgba(251,249,246,0.90)] backdrop-blur-xl border border-[var(--k-line)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-3 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Depolama filtresi */}
          {family.storageOptions.length > 1 ? (
            <div className="flex items-center gap-1.5 flex-wrap px-1">
              <button
                onClick={() => setStorage(null)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  storage === null ? 'bg-[var(--k-canvas)] text-[var(--k-ink)]' : 'text-[var(--k-ink-3)] hover:bg-[var(--k-surface-3)]'
                }`}
              >
                Tümü
              </button>
              {family.storageOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setStorage(s)}
                  className={`px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                    storage === s ? 'bg-[var(--k-canvas)] text-[var(--k-ink)]' : 'text-[var(--k-ink-3)] hover:bg-[var(--k-surface-3)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : <div />}

          {/* Sıralama */}
          <div className="flex bg-[var(--k-surface-3)] rounded-xl p-1 shrink-0">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                  sort === opt.value ? 'bg-[var(--k-surface)] text-[var(--k-ink)] shadow-sm' : 'text-[var(--k-ink-3)] hover:text-[var(--k-ink-2)]'
                }`}
              >
                {opt.label}
                <span className={`ml-1.5 font-medium hidden md:inline ${sort === opt.value ? 'text-[var(--k-ink-4)]' : 'text-[var(--k-ink-4)]'}`}>
                  · {opt.hint}
                </span>
              </button>
            ))}
          </div>
          </div>
        )}

        {/* Teklif Listesi */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${sort}-${storage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {family.items.length === 0 ? (
              <div className="text-center py-20 text-[var(--k-ink-4)] text-[14px]">
                Bu filtrelerle eşleşen teklif yok.
              </div>
            ) : (
              family.items.map((offer, i) => {
                const gradeCfg = GRADE[offer.grade];
                const price = Number(offer.price);
                const isCheapest = price === cheapest;
                const isTopPick = i === 0;

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.24), duration: 0.4 }}
                  >
                    <Link
                      href={`/product/${offer.id}`}
                      className={`group flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6 rounded-[22px] bg-[var(--k-surface)] border transition-all hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 ${
                        isTopPick
                          ? 'border-transparent shadow-[0_0_0_1.5px_#EA580C,0_16px_40px_rgba(234,88,12,0.12)]'
                          : 'border-[var(--k-line)]'
                      }`}
                    >
                      {/* Sol: Durum + güven */}
                      <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isTopPick && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-[var(--k-ink)] bg-orange-600 px-2.5 py-1 rounded-full">
                              <Crown size={11} />
                              {sort === 'best_condition' ? 'En İyi Durum' : 'En Uygun Fiyat'}
                            </span>
                          )}
                          {offer.globalProduct?.storage && (
                            <span className="inline-flex items-center text-[11px] font-black text-[var(--k-ink-2)] bg-[var(--k-surface-3)] px-2.5 py-1 rounded-full">
                              {offer.globalProduct.storage}
                            </span>
                          )}
                          {gradeCfg && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full"
                              style={{ color: gradeCfg.color, background: gradeCfg.bg, border: `1px solid ${gradeCfg.border}` }}
                            >
                              <ShieldCheck size={10} /> {offer.grade} · {gradeCfg.label}
                            </span>
                          )}
                          {offer.batteryHealth !== null && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--k-ink-2)] bg-[var(--k-surface-2)] border border-[var(--k-line)] px-2.5 py-1 rounded-full">
                              <Battery
                                size={11}
                                className={offer.batteryHealth >= 85 ? 'text-[var(--k-hot)]' : offer.batteryHealth >= 70 ? 'text-amber-500' : 'text-red-400'}
                              />
                              Pil %{offer.batteryHealth}
                            </span>
                          )}
                          {offer.hasBox && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--k-ink-3)] bg-[var(--k-surface-2)] border border-[var(--k-line)] px-2.5 py-1 rounded-full">
                              <Box size={10} /> Kutulu
                            </span>
                          )}
                          {offer.warrantyMonths ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full">
                              {offer.warrantyMonths} Ay Garanti
                            </span>
                          ) : null}
                        </div>

                        <DealerTrustBadge
                          rating={offer.store?.rating}
                          reviewCount={offer.store?.reviewCount}
                          isPremium={offer.store?.isPremium}
                          jobsCompleted={offer.store?.jobsCompleted}
                        />
                      </div>

                      {/* Sağ: Fiyat + CTA */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--k-line)]">
                        <div className="text-right">
                          {isCheapest && family.items.length > 1 && (
                            <span className="block text-[9px] font-black uppercase tracking-wide text-orange-600 mb-0.5">En Düşük Fiyat</span>
                          )}
                          <span className="font-editorial block text-[26px] md:text-[30px] leading-none text-[var(--k-ink)]">
                            {fmt(price)}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--k-surface-3)] group-hover:bg-[var(--k-canvas)] flex items-center justify-center text-[var(--k-ink-4)] group-hover:text-[var(--k-ink)] shrink-0 transition-colors">
                          <ChevronRight size={16} strokeWidth={2.5} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function StatBlock({
  icon, label, value, accent,
}: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--k-ink-4)]">
        {icon} {label}
      </span>
      <span className={`font-editorial text-[22px] md:text-[26px] leading-none ${accent ? 'text-[var(--k-hot)]' : 'text-[var(--k-ink)]'}`}>
        {value}
      </span>
    </div>
  );
}
