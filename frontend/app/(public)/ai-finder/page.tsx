'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronRight, Check, RotateCcw, Trophy,
  DollarSign, CreditCard, TrendingUp, Sparkles,
  Smartphone, Gamepad2, Camera, Briefcase, Brain,
} from 'lucide-react';
import { useProducts } from '@/lib/hooks/useProducts';
import DealerStockCard from '@/components/DealerStockCard';

// ─── Types ──────────────────────────────────────────────────────────────────
type StepId = 'budget' | 'brand' | 'usage';
interface WizardAnswers { budget: string | null; brand: string | null; usage: string | null; }

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'budget' as StepId,
    question: 'Bütçeniz nedir?',
    subtitle: 'Cihaza ayırmayı planladığınız maksimum tutarı seçin.',
    options: [
      { value: 'under5k',  label: '5.000 ₺ altı',        sub: 'Ekonomik · Temel ihtiyaçlar için yeterli',               Icon: DollarSign,  min: 0,     max: 5000   },
      { value: '5to10k',   label: '5.000 – 10.000 ₺',    sub: 'Orta segment · Fiyat / performans dengesi',              Icon: CreditCard,  min: 5000,  max: 10000  },
      { value: '10to20k',  label: '10.000 – 20.000 ₺',   sub: 'Üst segment · Premium özellikler',                       Icon: TrendingUp,  min: 10000, max: 20000  },
      { value: 'over20k',  label: '20.000 ₺ üzeri',      sub: 'Amiral gemisi · Kullanılabilecek en iyi deneyim',        Icon: Sparkles,    min: 20000, max: 999999 },
    ],
  },
  {
    id: 'brand' as StepId,
    question: 'Marka tercihiniz?',
    subtitle: 'Belirli bir marka tercihiniz yoksa "Tüm Markalar" seçeneğini tercih edebilirsiniz.',
    options: [
      { value: 'Apple',   label: 'Apple',        sub: 'iOS ekosistemi · Uzun yazılım desteği · Yüksek yeniden satış değeri', initial: 'A', bg: '#1d1d1f' },
      { value: 'Samsung', label: 'Samsung',       sub: 'Galaxy serisi · Geniş model yelpazesi · Android',                   initial: 'S', bg: '#1428A0' },
      { value: 'Xiaomi',  label: 'Xiaomi',        sub: 'Yüksek donanım · Uygun fiyat · HyperOS',                           initial: 'X', bg: '#FF6900' },
      { value: 'all',     label: 'Tüm Markalar',  sub: 'Tüm markalar arasından en uygun eşleşmeyi bul',                    initial: '→', bg: '#5B21B6' },
    ],
  },
  {
    id: 'usage' as StepId,
    question: 'Telefonu ağırlıklı ne için kullanırsınız?',
    subtitle: 'Bu tercihe göre en uygun özelliklere sahip cihazlar öne çıkarılacak.',
    options: [
      { value: 'gaming',   label: 'Gaming',            sub: 'Yüksek işlemci gücü · Büyük depolama · Uzun pil ömrü',    Icon: Gamepad2   },
      { value: 'photo',    label: 'Fotoğraf & Video',   sub: 'Üstün kamera sistemi · Renk doğruluğu · Gece çekimi',     Icon: Camera     },
      { value: 'business', label: 'İş & Verimlilik',    sub: 'Güvenilirlik · Ekosistem bütünlüğü · Güvenlik',           Icon: Briefcase  },
      { value: 'general',  label: 'Genel Kullanım',     sub: 'Her şeyde denge · Günlük kullanım için ideal seçim',      Icon: Smartphone },
    ],
  },
] as const;

const BUDGET_MAP: Record<string, { min: number; max: number }> = {
  under5k:  { min: 0,     max: 5000   },
  '5to10k': { min: 5000,  max: 10000  },
  '10to20k':{ min: 10000, max: 20000  },
  over20k:  { min: 20000, max: 999999 },
};

// ─── Filtering ───────────────────────────────────────────────────────────────
function filterAndRank(products: any[], answers: WizardAnswers): any[] {
  let list = [...products];

  if (answers.budget) {
    const { min, max } = BUDGET_MAP[answers.budget] ?? { min: 0, max: 999999 };
    list = list.filter(p => p.price >= min && p.price <= max);
  }

  if (answers.brand && answers.brand !== 'all') {
    list = list.filter(p => p.brand === answers.brand);
  }

  const grade = (p: any) => p.grade || p.cosmeticGrade || '';
  const storage = (p: any) => parseInt(p.storage) || 0;
  const battery = (p: any) => p.batteryHealth || 0;

  if (answers.usage === 'photo') {
    list.sort((a, b) => {
      const sa = (a.brand === 'Apple' || a.brand === 'Samsung' ? 2 : 0) + (grade(a) === 'A+' || grade(a) === 'A' ? 1 : 0);
      const sb = (b.brand === 'Apple' || b.brand === 'Samsung' ? 2 : 0) + (grade(b) === 'A+' || grade(b) === 'A' ? 1 : 0);
      return sb - sa;
    });
  } else if (answers.usage === 'gaming') {
    list.sort((a, b) => storage(b) - storage(a));
  } else if (answers.usage === 'business') {
    list.sort((a, b) => (b.brand === 'Apple' ? 1 : 0) - (a.brand === 'Apple' ? 1 : 0));
  } else {
    list.sort((a, b) => battery(b) - battery(a) || a.price - b.price);
  }

  return list.slice(0, 3);
}

// ─── Rank config (no emojis) ─────────────────────────────────────────────────
const RANKS = [
  { num: '1',  label: 'En İyi Eşleşme', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  { num: '2',  label: '2. Öneri',        color: '#1E40AF', bg: '#DBEAFE', border: '#93C5FD' },
  { num: '3',  label: '3. Öneri',        color: '#374151', bg: '#F3F4F6', border: '#D1D5DB' },
];

// ─── Option card ─────────────────────────────────────────────────────────────
function OptionCard({
  label, sub, selected, onClick, Icon, initial, bg,
}: {
  label: string; sub?: string; selected: boolean; onClick: () => void;
  Icon?: React.ComponentType<any>; initial?: string; bg?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={selected ? 'w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-150 border-violet-300 shadow-sm shadow-violet-100' : 'w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-150 border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}
      style={selected ? { background: 'linear-gradient(135deg, #f0fdf4, #F5F3FF)', borderColor: '#C4B5FD' } : { background: '#fff' }}
    >
      {Icon ? (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: selected ? 'rgba(6,95,70,0.1)' : '#F8FAFC' }}
        >
          <Icon size={18} strokeWidth={1.5} style={{ color: selected ? '#5B21B6' : '#94A3B8' }} />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
          style={{ background: selected ? '#5B21B6' : (bg || '#94A3B8') }}
        >
          {initial}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-[14px] leading-tight ${selected ? 'text-violet-800' : 'text-slate-800'}`}>
          {label}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sub}</p>
        )}
      </div>

      <div
        className={selected ? 'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all bg-violet-600 border-violet-600' : 'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all border-slate-300 bg-white'}
      >
        {selected && <Check size={10} className="text-white" strokeWidth={3.5} />}
      </div>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AIFinderPage() {
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<WizardAnswers>({ budget: null, brand: null, usage: null });
  const [results, setResults]     = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { data: realProducts = [], isLoading: productsLoading } = useProducts();
  const products = realProducts as any[];

  const currentStep = STEPS[step];
  const selectedValue = answers[currentStep.id] ?? null;
  const canAdvance    = selectedValue !== null;
  const progress      = ((step + (canAdvance ? 0.5 : 0)) / STEPS.length) * 100;

  const handleSelect = (value: string) =>
    setAnswers(a => ({ ...a, [currentStep.id]: value }));

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setResults(filterAndRank(products, answers));
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) { setShowResults(false); }
    else              { setStep(s => Math.max(0, s - 1)); }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({ budget: null, brand: null, usage: null });
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAFBFC' }}>
      {/* Brand accent line */}
      <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #5B21B6 0%, #A78BFA 50%, #C4B5FD 100%)' }} />

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Geri dön
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(6,95,70,0.08)' }}
            >
              <Brain size={15} strokeWidth={1.5} style={{ color: '#5B21B6' }} />
            </div>
            <span className="text-sm font-bold text-slate-700">AI Telefon Bulucu</span>
          </div>

          {!showResults ? (
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {step + 1} / {STEPS.length}
            </span>
          ) : (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
            >
              <RotateCcw size={13} />
              Yeniden
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Results ─────────────────────────────────────────────── */}
        {showResults ? (
          <div>
            {/* Result header */}
            <div className="mb-8">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4"
                style={{ background: 'rgba(6,95,70,0.08)', color: '#5B21B6' }}
              >
                <Trophy size={12} strokeWidth={2} />
                Sonuçlar hazır
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">Sizin için öneriler</h1>
              <p className="text-sm text-slate-500">
                Tercihlerinize göre sıralanan{' '}
                <span className="font-semibold text-slate-700">{results.length} cihaz</span>
              </p>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={22} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="font-bold text-slate-700 text-base mb-1">Eşleşen cihaz bulunamadı</p>
                <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Bu bütçe ve marka kombinasyonu için ürün bulunmuyor. Filtreleri değiştirmeyi deneyin.</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                  style={{ background: '#5B21B6' }}
                >
                  <RotateCcw size={14} />
                  Tekrar Dene
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {results.map((product, i) => (
                  <div key={product.id} className="relative pt-4">
                    <div
                      className="absolute top-0 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: RANKS[i].bg,
                        color: RANKS[i].color,
                        border: `1px solid ${RANKS[i].border}`,
                      }}
                    >
                      <span className="font-black">#{RANKS[i].num}</span>
                      {RANKS[i].label}
                    </div>
                    <DealerStockCard product={product} index={i} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={15} />
                Geri
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw size={14} />
                Baştan Başla
              </button>
            </div>
          </div>

        ) : (
          // ── Wizard Steps ──────────────────────────────────────────
          <div>
            {/* Progress bar */}
            <div className="mb-8">
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.round((step / STEPS.length) * 100)}%`,
                    background: 'linear-gradient(90deg, #5B21B6, #A78BFA)',
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-7">
              <h1 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                {currentStep.question}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentStep.options.map((opt: any) => (
                <OptionCard
                  key={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={selectedValue === opt.value}
                  onClick={() => handleSelect(opt.value)}
                  Icon={'Icon' in opt ? opt.Icon : undefined}
                  initial={'initial' in opt ? opt.initial : undefined}
                  bg={'bg' in opt ? opt.bg : undefined}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={15} />
                  Geri
                </button>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={15} />
                  Vazgeç
                </Link>
              )}

              <button
                onClick={handleNext}
                disabled={!canAdvance || (step === STEPS.length - 1 && productsLoading)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                style={
                  canAdvance && !productsLoading
                    ? { background: '#5B21B6', boxShadow: '0 4px 14px rgba(6,95,70,0.28)' }
                    : { background: '#CBD5E1' }
                }
              >
                {step === STEPS.length - 1
                  ? (productsLoading ? 'Ürünler yükleniyor…' : 'Sonuçları Göster')
                  : 'Devam'}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
