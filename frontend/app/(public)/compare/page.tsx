'use client';
import Link from 'next/link';
import { ShoppingCart, X, ArrowLeft, BarChart2, Smartphone, Zap, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { GRADE_LABELS } from '@/lib/mock-data';
import type { MockProduct } from '@/lib/mock-data';
import SafeImage from '@/components/ui/SafeImage';
import BatteryGauge from '@/components/BatteryGauge';
import { toast } from 'sonner';
import { resolveUploadUrl } from '@/lib/resolveUrl';

// ─── Row definition ───────────────────────────────────────────────────────────
type RowKey = 'brand' | 'model' | 'storage' | 'color' | 'grade' | 'battery' | 'price';

const ROWS: { key: RowKey; label: string; icon?: string }[] = [
  { key: 'brand',   label: 'Marka'        },
  { key: 'model',   label: 'Model'        },
  { key: 'storage', label: 'Depolama'     },
  { key: 'color',   label: 'Renk'         },
  { key: 'grade',   label: 'Durum / Grade'},
  { key: 'battery', label: 'Pil Sağlığı'  },
  { key: 'price',   label: 'Fiyat'        },
];

function getGradeStyle(product: MockProduct): { bg: string; text: string; border: string } {
  switch (product.cosmeticGrade) {
    case 'A+': return { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' };
    case 'A':  return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BAE6FD' };
    case 'B':  return { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' };
    case 'C':  return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' };
    default:   return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
  }
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 text-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 flex items-center justify-center shadow-lg">
          <BarChart2 size={40} className="text-orange-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-black">0</span>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Karşılaştırma Listesi Boş</h2>
        <p className="text-zinc-500 max-w-sm text-base">
          Ürün kartlarındaki <span className="font-semibold text-zinc-700">Karşılaştır</span> butonuna tıklayarak en az 2 ürün seçin
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[var(--brand)] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
      >
        <ArrowLeft size={16} />
        Ürünlere Göz At
      </Link>
    </div>
  );
}

// ─── Battery cell renderer ────────────────────────────────────────────────────
function BatteryCell({ product }: { product: MockProduct }) {
  if (!product.batteryHealth || product.batteryHealth === 0) {
    return <span className="text-zinc-400 text-sm">—</span>;
  }
  return (
    <div className="flex flex-col items-center gap-1.5">
      <BatteryGauge percent={product.batteryHealth} size="md" showLabel />
    </div>
  );
}

// ─── Compare Table ────────────────────────────────────────────────────────────
function CompareTable({ products }: { products: MockProduct[] }) {
  const { addToCart, openCart, toggleCompare } = useApp();
  const minPrice = Math.min(...products.map((p) => p.price));

  const handleAddToCart = (product: MockProduct) => {
    addToCart(product);
    toast.success('Sepete Eklendi', {
      description: `${product.brand} ${product.model} — ${product.price.toLocaleString('tr-TR')} ₺`,
      action: { label: 'Sepeti Aç', onClick: openCart },
      duration: 3500,
    });
  };

  const renderCell = (product: MockProduct, key: RowKey) => {
    if (key === 'battery') return <BatteryCell product={product} />;

    if (key === 'grade') {
      const gs = getGradeStyle(product);
      return (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: gs.bg, color: gs.text, border: `1px solid ${gs.border}` }}
        >
          <CheckCircle2 size={12} />
          {product.cosmeticGrade} — {GRADE_LABELS[product.cosmeticGrade] ?? product.cosmeticGrade}
        </div>
      );
    }

    if (key === 'price') {
      const isLowest = product.price === minPrice && products.length > 1;
      return (
        <div className="flex flex-col items-center gap-1">
          <span className={`font-black text-lg leading-none ${isLowest ? 'text-orange-600' : 'text-zinc-800'}`}>
            {product.price.toLocaleString('tr-TR')} ₺
          </span>
          {isLowest && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              En İyi Fiyat
            </span>
          )}
        </div>
      );
    }

    const text = (() => {
      switch (key) {
        case 'brand':   return product.brand;
        case 'model':   return product.model;
        case 'storage': return product.storage;
        case 'color':   return product.color;
        default:        return '—';
      }
    })();

    return <span className="text-zinc-700 font-medium text-sm">{text}</span>;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div
        className="grid gap-3 min-w-[600px]"
        style={{ gridTemplateColumns: `160px repeat(${products.length}, 1fr)` }}
      >
        {/* ── Header: Product cards ── */}
        <div /> {/* corner */}
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-3xl border border-zinc-100 shadow-md p-5 flex flex-col items-center gap-4 relative overflow-hidden"
            style={{ boxShadow: product.price === minPrice && products.length > 1 ? '0 0 0 2px #EA580C, 0 8px 32px rgba(234,88,12,0.1)' : undefined }}
          >
            {product.price === minPrice && products.length > 1 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-3xl" />
            )}
            <button
              onClick={() => toggleCompare(product)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors text-zinc-400"
              aria-label="Karşılaştırmadan çıkar"
            >
              <X size={13} />
            </button>
            <div className="relative w-[140px] h-[140px] flex-shrink-0">
              <SafeImage
                src={resolveUploadUrl(product.image)}
                alt={`${product.brand} ${product.model}`}
                fill
                className="object-contain"
                fallbackIcon={<Smartphone size={40} className="opacity-20 text-slate-400" />}
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{product.brand}</p>
              <h3 className="font-bold text-zinc-900 text-base leading-tight mt-0.5">{product.model}</h3>
            </div>
          </div>
        ))}

        {/* ── Comparison rows ── */}
        {ROWS.map((row) => (
          <>
            <div
              key={`label-${row.key}`}
              className="flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-zinc-50 to-slate-50 border border-zinc-100 text-sm font-bold text-zinc-600"
            >
              {row.label}
            </div>
            {products.map((product) => (
              <div
                key={`${row.key}-${product.id}`}
                className="flex items-center justify-center px-3 py-3 rounded-2xl border border-zinc-100 bg-white text-center transition-colors hover:border-zinc-200"
              >
                {renderCell(product, row.key)}
              </div>
            ))}
          </>
        ))}

        {/* ── Action row ── */}
        <div className="flex items-center px-4 py-3 rounded-2xl bg-gradient-to-r from-zinc-50 to-slate-50 border border-zinc-100 text-sm font-bold text-zinc-600">
          Satın Al
        </div>
        {products.map((product) => (
          <div key={`actions-${product.id}`} className="flex flex-col gap-2 py-2">
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[var(--brand)] text-white text-xs font-bold uppercase tracking-wide hover:opacity-90 transition-opacity shadow-md"
            >
              <ShoppingCart size={14} />
              Sepete Ekle
            </button>
            <Link
              href={`/product/${product.id}`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl bg-zinc-100 text-zinc-600 text-xs font-semibold hover:bg-zinc-200 transition-colors text-center"
            >
              Ürünü İncele
            </Link>
            <button
              onClick={() => toggleCompare(product)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl text-zinc-400 text-xs font-medium hover:bg-red-50 hover:text-red-400 transition-colors"
            >
              <X size={11} />
              Listeden Çıkar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const { compareList } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-10 flex items-center gap-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-2xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          aria-label="Geri"
        >
          <ArrowLeft size={18} className="text-zinc-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Telefon Karşılaştır</h1>
            {compareList.length >= 2 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
                <Zap size={10} />
                {compareList.length} ürün
              </span>
            )}
          </div>
          {compareList.length >= 2 ? (
            <p className="text-zinc-500 text-sm mt-1">
              Yan yana karşılaştırın, en iyi seçimi yapın
            </p>
          ) : (
            <p className="text-zinc-500 text-sm mt-1">En az 2 ürün seçin</p>
          )}
        </div>
      </div>

      {compareList.length < 2 ? (
        <EmptyState />
      ) : (
        <CompareTable products={compareList as MockProduct[]} />
      )}
    </div>
  );
}
