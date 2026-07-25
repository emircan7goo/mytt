'use client';
import { X, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type CosmeticGrade, GRADE_LABELS } from '@/lib/mock-data';

export type FilterState = {
  brands:    string[];
  grades:    CosmeticGrade[];
  minPrice:  number;
  maxPrice:  number;
  inStockOnly: boolean;
};

export const DEFAULT_FILTERS: FilterState = {
  brands:     [],
  grades:     [],
  minPrice:   0,
  maxPrice:   100000,
  inStockOnly: false,
};

const BRAND_OPTIONS = ['Apple', 'Samsung', 'Xiaomi', 'Google', 'OnePlus', 'Huawei'];
const GRADE_OPTIONS: CosmeticGrade[] = ['A+', 'A', 'B', 'C'];
const PRICE_PRESETS = [
  { label: '0 – 15.000 ₺',  min: 0,     max: 15000  },
  { label: '15 – 25.000 ₺', min: 15000, max: 25000  },
  { label: '25 – 40.000 ₺', min: 25000, max: 40000  },
  { label: '40.000 ₺ +',    min: 40000, max: 100000 },
];

interface FilterSidebarProps {
  filters:    FilterState;
  onChange:   (f: FilterState) => void;
  totalCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function FilterSidebar({
  filters, onChange, totalCount, mobileOpen, onMobileClose,
}: FilterSidebarProps) {
  const toggleBrand = (brand: string) => {
    const has = filters.brands.includes(brand);
    onChange({ ...filters, brands: has ? filters.brands.filter(b => b !== brand) : [...filters.brands, brand] });
  };

  const toggleGrade = (g: CosmeticGrade) => {
    const has = filters.grades.includes(g);
    onChange({ ...filters, grades: has ? filters.grades.filter(x => x !== g) : [...filters.grades, g] });
  };

  const setPricePreset = (min: number, max: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const isPresetActive = (min: number, max: number) =>
    filters.minPrice === min && filters.maxPrice === max;

  const hasFilters =
    filters.brands.length > 0 ||
    filters.grades.length > 0 ||
    filters.minPrice !== DEFAULT_FILTERS.minPrice ||
    filters.maxPrice !== DEFAULT_FILTERS.maxPrice ||
    filters.inStockOnly;

  const gradeStyles: Record<CosmeticGrade, { active: string; inactive: string }> = {
    'A+': {
      active:   'bg-orange-600 text-white border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.2)]',
      inactive: 'bg-transparent text-[var(--k-ink-3)] border-[var(--k-line)] hover:border-[var(--k-line-2)]',
    },
    A: {
      active:   'bg-zinc-900 text-white border-zinc-900 shadow-[0_0_15px_rgba(0,0,0,0.1)]',
      inactive: 'bg-transparent text-[var(--k-ink-3)] border-[var(--k-line)] hover:border-[var(--k-line-2)]',
    },
    B: {
      active:   'bg-[var(--k-surface-3)] text-[var(--k-ink)] border-[var(--k-line)] shadow-[0_0_15px_rgba(0,0,0,0.05)]',
      inactive: 'bg-transparent text-[var(--k-ink-3)] border-[var(--k-line)] hover:border-[var(--k-line-2)]',
    },
    C: {
      active:   'bg-[var(--k-surface-3)] text-[var(--k-ink-2)] border-[var(--k-line-2)] shadow-none',
      inactive: 'bg-transparent text-[var(--k-ink-3)] border-[var(--k-line)] hover:border-[var(--k-line-2)]',
    },
  };

  const inner = (
    <div className="flex flex-col p-8 backdrop-blur-3xl bg-[rgba(16,16,19,0.85)] bg-gradient-to-br from-slate-50 to-transparent text-[var(--k-ink)] min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--k-line)] px-1">
        <div className="flex items-center gap-2 text-[var(--k-ink)]">
          <SlidersHorizontal size={20} strokeWidth={2.5} className="text-[var(--k-ink-3)]" />
          <span className="font-heading font-thin text-[20px] tracking-tight">Filtreler</span>
          <span className="text-[var(--k-ink-3)] bg-[var(--k-surface-2)] text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full border border-[var(--k-line-2)]">
            {totalCount} NODE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="flex items-center gap-1 text-[11px] text-[var(--k-ink-3)] hover:text-[var(--k-ink)] uppercase tracking-widest font-bold transition-colors"
            >
              <RotateCcw size={12} strokeWidth={2.5} /> Sıfırla
            </button>
          )}
          <button
            className="lg:hidden p-1.5 rounded-full hover:bg-[var(--k-surface-3)] transition-colors text-[var(--k-ink-3)]"
            onClick={onMobileClose}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── MARKA ── */}
      <div>
        <h4 className="text-[10px] font-black text-[var(--k-ink-2)] uppercase tracking-widest mb-6">Mimari & Üretici</h4>
        <div className="flex flex-col gap-4">
          {BRAND_OPTIONS.map(brand => (
            <label key={brand} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="opacity-0 absolute -z-10"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300
                   ${filters.brands.includes(brand) ? 'bg-zinc-900 border-zinc-900' : 'bg-transparent border-[var(--k-line-2)] group-hover:border-zinc-500'}`}>
                   <svg width="10" height="8" viewBox="0 0 12 10" fill="none" className={`transition-opacity duration-300 ${filters.brands.includes(brand) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                     <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                </div>
              </div>
              
              <span className={`text-[14px] font-light tracking-wide transition-colors ${filters.brands.includes(brand) ? 'text-[var(--k-ink)] font-bold' : 'text-[var(--k-ink-2)] group-hover:text-[var(--k-ink)]'}`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full h-8" />

      {/* ── KOZMETİK DURUM ── */}
      <div>
        <h4 className="text-[10px] font-black text-[var(--k-ink-2)] uppercase tracking-widest mb-6">Kozmetik Frekansı</h4>
        <div className="flex flex-col gap-3">
          {GRADE_OPTIONS.map(g => {
            const isActive = filters.grades.includes(g);
            const style = gradeStyles[g];
            return (
              <button
                key={g}
                onClick={() => toggleGrade(g)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-[13px] tracking-wide transition-all duration-300
                  ${isActive ? style.active : style.inactive}`}
              >
                <span className={isActive ? 'font-bold' : 'font-light'}>{GRADE_LABELS[g]}</span>
                {isActive && (
                  <Check size={16} strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-8" />

      {/* ── FİYAT ARALIĞI ── */}
      <div>
        <h4 className="text-[10px] font-black text-[var(--k-ink-2)] uppercase tracking-widest mb-6">Bütçe Topolojisi</h4>
        <div className="flex flex-col gap-3">
          {PRICE_PRESETS.map(p => (
               <button
                 key={p.label}
                 onClick={() => setPricePreset(p.min, p.max)}
                 className={`text-left px-5 py-3 rounded-xl border text-[13px] font-light tracking-wide transition-all duration-300
                   ${isPresetActive(p.min, p.max)
                     ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm font-bold'
                     : 'bg-transparent text-[var(--k-ink-2)] border-[var(--k-line-2)] hover:border-zinc-500 hover:bg-[var(--k-surface-2)]'
                   }
                 `}
               >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-8" />

      {/* ── STOK ── */}
      <label className="flex items-center justify-between cursor-pointer group bg-[var(--k-surface-2)] border border-[var(--k-line)] p-5 rounded-xl hover:bg-[var(--k-surface-3)] transition-colors">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-wide text-[var(--k-ink)]">Tükenenleri Filtrele</span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--k-ink-2)] mt-1">Stoktaki cihazlar</span>
        </div>
        <div
          onClick={(e) => { e.preventDefault(); onChange({ ...filters, inStockOnly: !filters.inStockOnly }); }}
          className={`relative w-12 h-6 rounded-full transition-all duration-400
            ${filters.inStockOnly ? 'bg-zinc-900' : 'bg-zinc-300'}`}
        >
          <div className={`absolute top-[2px] w-5 h-5 bg-[var(--k-surface)] rounded-full shadow-sm transition-all duration-400
            ${filters.inStockOnly ? 'left-[26px]' : 'left-[2px]'}`}
          />
        </div>
      </label>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-[320px] shrink-0 bg-transparent rounded-[32px] overflow-hidden self-start sticky top-[130px] border border-[var(--k-line)] shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
        {inner}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[rgba(16,16,19,0.85)] backdrop-blur-md lg:hidden z-[200]" onClick={onMobileClose} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="fixed left-0 top-0 bottom-0 w-[300px] border-r border-[var(--k-line)] bg-[var(--k-surface)] z-[201] overflow-y-auto shadow-[20px_0_40px_rgba(0,0,0,0.1)] lg:hidden">
              <div className="h-full">
                {inner}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
