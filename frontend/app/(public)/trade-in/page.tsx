'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, Check, RefreshCcw, ArrowRight, Smartphone, TrendingUp,
  Camera, Upload, X, Loader2, Clock, AlertCircle,
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useCreateSellRequest } from '@/lib/hooks/useSellRequests';
import apiClient from '@/lib/api';

// ─── Data ────────────────────────────────────────────────────────────────────
const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'OnePlus', 'Oppo'] as const;
type Brand = typeof BRANDS[number];

const BRAND_META: Record<Brand, { initial: string; color: string }> = {
  Apple:   { initial: 'A', color: "var(--k-ink)" },
  Samsung: { initial: 'S', color: '#1428A0' },
  Xiaomi:  { initial: 'X', color: '#FF6900' },
  Huawei:  { initial: 'H', color: '#CF0A2C' },
  OnePlus: { initial: 'O', color: '#EB0028' },
  Oppo:    { initial: 'O', color: '#1F7AE0' },
};

const MODELS_BY_BRAND: Record<Brand, string[]> = {
  Apple:   ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
  Samsung: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy A54', 'Galaxy A34'],
  Xiaomi:  ['14 Ultra', '14 Pro', '13 Pro', '13', '12 Pro', 'Redmi Note 13 Pro', 'Redmi Note 12'],
  Huawei:  ['Pura 70 Pro', 'P60 Pro', 'P50 Pro', 'Mate 50 Pro', 'Nova 11'],
  OnePlus: ['12', '11', '10 Pro', '9 Pro'],
  Oppo:    ['Find X7 Ultra', 'Find X7', 'Find X6 Pro', 'Reno 10 Pro', 'A98'],
};

const BASE_VALUES: Record<string, number> = {
  'iPhone 15 Pro Max': 34000, 'iPhone 15 Pro': 28000, 'iPhone 15': 22000,
  'iPhone 14 Pro': 20000, 'iPhone 14': 16000, 'iPhone 13': 13000, 'iPhone 12': 9000, 'iPhone 11': 6500,
  'Galaxy S24 Ultra': 32000, 'Galaxy S24+': 25000, 'Galaxy S24': 22000,
  'Galaxy S23 Ultra': 22000, 'Galaxy S23': 16000, 'Galaxy A54': 8000, 'Galaxy A34': 5500,
  '14 Ultra': 28000, '14 Pro': 18000, '13 Pro': 14000, '13': 10000, '12 Pro': 8000,
  'Redmi Note 13 Pro': 5000, 'Redmi Note 12': 3500,
  'Pura 70 Pro': 16000, 'P60 Pro': 12000, 'P50 Pro': 8000, 'Mate 50 Pro': 10000, 'Nova 11': 5000,
  '12': 16000, '11': 12000, '10 Pro': 9000, '9 Pro': 7000,
  'Find X7 Ultra': 24000, 'Find X7': 20000, 'Find X6 Pro': 15000, 'Reno 10 Pro': 9000, 'A98': 6000,
};

const CONDITIONS = [
  {
    value: 'mint',
    label: 'Çok İyi',
    sub: 'Gözle görülür hasar yok. Ekran kusursuz, gövde temiz.',
    multiplier: 1.00,
    pct: 100,
    bars: 4,
    accent: '#EA580C',
    bg: '#F0FDF4',
    border: '#FDBA74',
  },
  {
    value: 'good',
    label: 'İyi',
    sub: 'Hafif çizikler mevcut. Ekran ve tüm özellikler sorunsuz.',
    multiplier: 0.80,
    pct: 80,
    bars: 3,
    accent: '#D4501E',
    bg: '#EFF6FF',
    border: '#93C5FD',
  },
  {
    value: 'fair',
    label: 'Orta',
    sub: 'Gözle görülür çizikler / hafif ezik. Her şey çalışıyor.',
    multiplier: 0.60,
    pct: 60,
    bars: 2,
    accent: '#D97706',
    bg: '#FFFBEB',
    border: '#FCD34D',
  },
  {
    value: 'damaged',
    label: 'Hasarlı',
    sub: 'Kırık ekran veya önemli fiziksel hasar mevcut.',
    multiplier: 0.35,
    pct: 35,
    bars: 1,
    accent: '#DC2626',
    bg: '#FEF2F2',
    border: '#FCA5A5',
  },
] as const;
type Condition = typeof CONDITIONS[number]['value'];

// ─── Health bar visual ────────────────────────────────────────────────────────
function HealthBars({ bars, accent }: { bars: number; accent: string }) {
  return (
    <div className="flex items-end gap-[3px] flex-shrink-0">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-[5px] rounded-sm"
          style={{
            height: `${6 + i * 4}px`,
            background: i <= bars ? accent : '#E2E8F0',
          }}
        />
      ))}
    </div>
  );
}

// ─── Step progress bar ────────────────────────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="h-1 bg-[var(--k-surface-3)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.round((step / total) * 100)}%`,
            background: 'linear-gradient(90deg, #C2410C, #3b82f6)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Countdown hook ──────────────────────────────────────────────────────────
function useCountdown(expiresAt: string) {
  const calc = () => Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function TradeInPage() {
  const router = useRouter();
  const { user, setShowAuthModal } = useApp();
  const createRequest = useCreateSellRequest();

  const [step, setStep]           = useState<0|1|2|3|4>(0);
  const [brand, setBrand]         = useState<Brand | null>(null);
  const [model, setModel]         = useState<string | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [result, setResult]       = useState<number | null>(null);
  const [images, setImages]       = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [created, setCreated]     = useState<any>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const canAdvance =
    (step === 0 && brand     !== null) ||
    (step === 1 && model     !== null) ||
    (step === 2 && condition !== null) ||
    (step === 3 && images.length >= 2) ||
    step === 4;

  const handleNext = () => {
    if (step === 2) {
      const base = BASE_VALUES[model ?? ''] ?? 5000;
      const mult = CONDITIONS.find(c => c.value === condition)?.multiplier ?? 0.7;
      setResult(Math.round((base * mult) / 100) * 100);
    }
    if (step < 4) setStep((step + 1) as any);
  };

  const handleBack  = () => { if (step > 0) setStep((step - 1) as any); };
  const handleReset = () => { setStep(0); setBrand(null); setModel(null); setCondition(null); setResult(null); setImages([]); setCreated(null); };

  const selectedCondition = CONDITIONS.find(c => c.value === condition);

  // Fotoğraf yükleme
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 6) { alert('En fazla 6 fotoğraf.'); return; }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await apiClient.post('/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        urls.push(data.url);
      }
      setImages(prev => [...prev, ...urls]);
    } catch { alert('Fotoğraf yüklenirken hata oluştu.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }, [images]);

  // API gönder
  const handleSubmit = async () => {
    if (!user) { setShowAuthModal(true); return; }
    try {
      const res = await createRequest.mutateAsync({
        brand: brand!,
        model: model!,
        grade: condition === 'mint' ? 'A+' : condition === 'good' ? 'A' : condition === 'fair' ? 'B' : 'C',
        imagesUrl: images,
        requestType: 'TRADE_IN' as any,
        description: `Takas talebi — ${selectedCondition?.label} durum, tahmini değer: ${result?.toLocaleString('tr-TR')} ₺`,
      } as any);
      setCreated(res);
      setStep(4);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Bir hata oluştu.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--k-surface-2)" }}>
      {/* Brand accent line — blue for trade-in */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #C2410C 0%, #3b82f6 50%, #93c5fd 100%)' }} />

      {/* Header */}
      <header className="bg-[var(--k-surface)] border-b border-[var(--k-line)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Geri dön
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.08)' }}
            >
              <RefreshCcw size={14} strokeWidth={1.5} style={{ color: '#D4501E' }} />
            </div>
            <span className="text-sm font-bold text-[var(--k-ink-2)]">Trade-In Hesaplayıcı</span>
          </div>

          {step < 3 ? (
            <span className="text-xs font-semibold text-[var(--k-ink-4)] tabular-nums">
              {step + 1} / 3
            </span>
          ) : (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors"
            >
              <RefreshCcw size={13} />
              Yeniden
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">

  // ── Başarı ekranı (Step 4)
        {step === 4 && created && (
          <TradeInSuccess created={created} brand={brand!} model={model!} result={result} onReset={handleReset} router={router} />
        )}

        {/* ── Result (Step 3) ──────────────────────────────────────────────── */}
        {step === 3 && result !== null && (
          <div className="space-y-6">
            {/* Price card */}
            <div className="bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] overflow-hidden">
              {/* Color header */}
              <div className="px-6 py-8 text-center" style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}>
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-blue-500 mb-3">
                  Tahmini Trade-In Değeri
                </p>
                <p className="text-5xl font-black text-[var(--k-ink)] tracking-tight tabular-nums">
                  {result.toLocaleString('tr-TR')}
                  <span className="text-2xl text-[var(--k-ink-4)] font-bold ml-2">₺</span>
                </p>
                <div
                  className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(37,99,235,0.1)', color: "var(--k-cool)" }}
                >
                  <TrendingUp size={11} strokeWidth={2} />
                  Güncel piyasa koşullarına göre tahmin
                </div>
              </div>

              {/* Summary */}
              <div className="px-6 py-5 space-y-0">
                {[
                  { label: 'Marka',    value: brand },
                  { label: 'Model',    value: model },
                  { label: 'Durum',    value: selectedCondition?.label },
                  { label: 'Değer oranı', value: `%${selectedCondition?.pct}` },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-[var(--k-line)]' : ''}`}
                  >
                    <span className="text-sm text-[var(--k-ink-3)]">{row.label}</span>
                    <span className="text-sm font-semibold text-[var(--k-ink)]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[var(--k-ink-4)] text-center leading-relaxed px-4">
              Bu değer tahmine dayalıdır. Kesin fiyat bayilerin teklifleriyle belirlenir.
            </p>

            {/* Photo step info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                Sonraki adımda <strong>en az 2 fotoğraf</strong> yüklemeniz gerekiyor.
                Bayiler cihazı görmeden teklif vermez.
              </p>
            </div>

            {/* CTA - Teklif Al */}
            <button
              onClick={handleNext}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #D4501E, #C2410C)', boxShadow: '0 4px 18px rgba(194,65,12,0.26)' }}
            >
              <Camera size={16} />
              Fotoğraf Ekle & Takas Talebi Başlat
              <ArrowRight size={15} />
            </button>

            {/* Footer nav */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--k-line)]">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--k-ink-3)] hover:text-[var(--k-ink)] transition-colors"
              >
                <ArrowLeft size={15} />
                Geri
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--k-line)] bg-[var(--k-surface)] text-sm font-semibold text-[var(--k-ink-2)] hover:bg-[var(--k-surface-2)] transition-colors"
              >
                <RefreshCcw size={14} />
                Baştan Hesapla
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Photo Upload ─────────────────────────────────────── */}
        {step === 3 && result === null && (
          <div className="space-y-5">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-[var(--k-ink)] mb-2">Fotoğraf Yükle</h1>
              <p className="text-sm text-[var(--k-ink-3)]">Bayiler cihazı görebilsin. En az 2, en fazla 6 fotoğraf.</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">Ön, arka, köşe ve ekran fotoğrafları tercih edilir.</p>
            </div>

            <button onClick={() => fileRef.current?.click()} disabled={uploading || images.length >= 6}
              className="w-full border-2 border-dashed border-[var(--k-line-2)] rounded-2xl py-10 flex flex-col items-center gap-3 hover:border-blue-400 transition-colors disabled:opacity-50">
              {uploading ? <Loader2 size={28} className="text-[var(--k-ink-4)] animate-spin" /> : <Upload size={28} className="text-[var(--k-ink-4)]" />}
              <p className="text-[var(--k-ink-2)] font-semibold text-sm">{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</p>
              <p className="text-[var(--k-ink-4)] text-xs">{images.length}/6 yüklendi</p>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[var(--k-line)] bg-[var(--k-surface-3)]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-[var(--k-void)]/70 rounded-full flex items-center justify-center">
                      <X size={11} className="text-white" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-[var(--k-void)]/70 text-white px-1.5 py-0.5 rounded-full font-bold">Ana</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-6 border-t border-[var(--k-line)]">
              <button onClick={handleBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--k-ink-3)] hover:text-[var(--k-ink)] transition-colors">
                <ArrowLeft size={15} /> Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={images.length < 2 || createRequest.isPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                style={{ background: '#C2410C', boxShadow: '0 4px 14px rgba(194,65,12,0.26)' }}
              >
                {createRequest.isPending ? <><Loader2 size={14} className="animate-spin" /> Gönderiliyor...</> : <>Teklif Al <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Wizard steps (0-2) ──────────────────────────────────────────── */}
        {step < 3 && (
          <div>
            <ProgressBar step={step} total={3} />

            {/* ── Step 0: Brand ─────────────────────────────────── */}
            {step === 0 && (
              <div>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-[var(--k-ink)] mb-2">Cihazın markası nedir?</h1>
                  <p className="text-sm text-[var(--k-ink-3)]">Hangi markaya ait cihazı değerlendirmek istiyorsunuz?</p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {BRANDS.map(b => {
                    const meta = BRAND_META[b];
                    const active = brand === b;
                    return (
                      <button
                        key={b}
                        onClick={() => { setBrand(b); setModel(null); }}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left font-semibold text-sm transition-all duration-150 ${ active ? 'shadow-sm' : 'border-[var(--k-line)] bg-[var(--k-surface)] hover:border-[var(--k-line-2)] hover:shadow-sm' }`}
                        style={
                          active
                            ? { borderColor: meta.color, background: `${meta.color}08` }
                            : {}
                        }
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                          style={{ background: active ? meta.color : '#E2E8F0', color: active ? '#fff' : '#94A3B8' }}
                        >
                          {meta.initial}
                        </div>
                        <span style={{ color: active ? meta.color : '#374151' }}>{b}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 1: Model ─────────────────────────────────── */}
            {step === 1 && brand && (
              <div>
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="px-2.5 py-1 rounded-md text-xs font-bold"
                      style={{ background: `${BRAND_META[brand].color}10`, color: BRAND_META[brand].color }}
                    >
                      {brand}
                    </div>
                  </div>
                  <h1 className="text-2xl font-black text-[var(--k-ink)] mb-2">Hangi modeli var?</h1>
                  <p className="text-sm text-[var(--k-ink-3)]">Cihazınızın tam modelini seçin.</p>
                </div>

                <div className="space-y-2">
                  {MODELS_BY_BRAND[brand].map(m => {
                    const active = model === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setModel(m)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left font-semibold text-[14px] transition-all duration-150 ${ active ? 'shadow-sm' : 'border-[var(--k-line)] bg-[var(--k-surface)] hover:border-[var(--k-line-2)] hover:shadow-sm' }`}
                        style={active ? { borderColor: '#D4501E', background: "var(--k-surface-2)", color: "var(--k-cool)" } : { color: "var(--k-ink-2)" }}
                      >
                        <span>{m}</span>
                        {active && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D4501E' }}>
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 2: Condition ─────────────────────────────── */}
            {step === 2 && (
              <div>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-[var(--k-ink)] mb-2">Cihazın durumu nedir?</h1>
                  <p className="text-sm text-[var(--k-ink-3)]">Genel dış görünüm ve çalışma durumunu en iyi tanımlayan seçeneği belirleyin.</p>
                </div>

                <div className="space-y-2.5">
                  {CONDITIONS.map(opt => {
                    const active = condition === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setCondition(opt.value)}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-150 ${ active ? 'shadow-sm' : 'border-[var(--k-line)] bg-[var(--k-surface)] hover:border-[var(--k-line-2)] hover:shadow-sm' }`}
                        style={active ? { borderColor: opt.border, background: opt.bg } : {}}
                      >
                        <HealthBars bars={opt.bars} accent={opt.accent} />
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-[14px] leading-tight"
                            style={{ color: active ? opt.accent : '#1E293B' }}
                          >
                            {opt.label}
                          </p>
                          <p className="text-xs text-[var(--k-ink-4)] mt-0.5 leading-relaxed">{opt.sub}</p>
                        </div>
                        <div
                          className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background: active ? opt.bg : '#F1F5F9',
                            color: active ? opt.accent : '#94A3B8',
                            border: `1px solid ${active ? opt.border : '#E2E8F0'}`,
                          }}
                        >
                          %{opt.pct}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--k-line)]">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--k-ink-3)] hover:text-[var(--k-ink)] transition-colors"
                >
                  <ArrowLeft size={15} />
                  Geri
                </button>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--k-ink-3)] hover:text-[var(--k-ink)] transition-colors"
                >
                  <ArrowLeft size={15} />
                  Vazgeç
                </Link>
              )}

              <button
                onClick={handleNext}
                disabled={!canAdvance}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                style={
                  canAdvance
                    ? { background: '#C2410C', boxShadow: '0 4px 14px rgba(194,65,12,0.26)' }
                    : { background: "var(--k-line-2)" }
                }
              >
                {step === 2 ? 'Değeri Hesapla' : 'Devam'}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Başarı Ekranı ────────────────────────────────────────────────────────────
function TradeInSuccess({ created, brand, model, result, onReset, router }: {
  created: any; brand: string; model: string; result: number | null;
  onReset: () => void; router: any;
}) {
  const countdown = useCountdown(created.expiresAt);
  return (
    <div className="space-y-5">
      <div className="bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] overflow-hidden text-center">
        <div className="px-6 py-8" style={{ background: 'linear-gradient(135deg,#FFF8F3,#FDF2EA)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg,#D4501E,#C2410C)' }}>
            <Check size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-[var(--k-ink)] mb-1">Takas Talebi Gönderildi!</h2>
          <p className="text-sm text-[var(--k-ink-3)]">{brand} {model} için takas talebin aktif.</p>
        </div>
        <div className="px-6 py-5">
          {/* Countdown */}
          <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <span className="text-amber-800 text-sm font-bold">Teklif Süresi Bitiyor</span>
            </div>
            <span className="text-2xl font-black text-amber-700 tabular-nums">{countdown}</span>
          </div>
          <div className="space-y-2 text-left">
            {[
              ['Talep Kodu', `#${created.id.slice(0,8).toUpperCase()}`],
              ['Tahmini Değer', result ? `${result.toLocaleString('tr-TR')} ₺` : '—'],
              ['Tür', '⇄ Takas Talebi'],
              ['Durum', 'Teklif Bekleniyor'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-2 border-b border-[var(--k-line)] last:border-0">
                <span className="text-[var(--k-ink-3)]">{k}</span>
                <span className="font-semibold text-[var(--k-ink)]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => router.push('/hesabim?tab=sell-requests')}
        className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
        style={{ background: '#C2410C' }}>
        Teklifleri Takip Et
      </button>
      <button onClick={onReset} className="w-full py-3 rounded-xl border border-[var(--k-line)] text-[var(--k-ink-3)] text-sm font-semibold hover:bg-[var(--k-surface-2)]">
        Yeni Takas Talebi
      </button>
    </div>
  );
}
