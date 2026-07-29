'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BRANDS = [
  {
    name: 'iPhone',
    count: 'Güncel İlanlar',
    bg: 'from-[var(--k-canvas)] via-[var(--k-void)] to-[var(--k-canvas)] text-white',
    border: 'border-[var(--k-line-2)]',
    accent: 'text-white',
    link: '/?brand=Apple',
    img: '/brands/apple.jpg',
  },
  {
    name: 'Samsung',
    count: 'Güncel İlanlar',
    bg: 'from-[var(--k-hot-deep)] via-[var(--k-void)] to-[var(--k-hot-deep)] text-white',
    border: 'border-[var(--k-hot-deep)]',
    accent: 'text-white',
    link: '/?brand=Samsung',
    img: '/brands/samsung.jpg',
  },
  {
    name: 'Xiaomi',
    count: 'Güncel İlanlar',
    bg: 'from-[var(--k-hot-deep)] via-[var(--k-void)] to-[var(--k-hot-deep)] text-white',
    border: 'border-[var(--k-hot-deep)]',
    accent: 'text-white',
    link: '/?brand=Xiaomi',
    img: '/brands/xiaomi.jpg',
  },
];

export default function BrandHubShowcase() {
  return (
    <div className="w-full my-4 sm:my-10 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-8">
        <div>
          <span className="text-[10px] sm:text-xs font-black text-[var(--k-hot)] tracking-widest uppercase">MARKA VİTRİNİ</span>
          <h3 className="text-base sm:text-3xl font-black text-[var(--k-ink)] mt-0.5 tracking-tight">
            Öne Çıkan <span className="text-[var(--k-hot)]">Sıfır & Hatasız 2. El Markaları</span>
          </h3>
        </div>
        <Link
          href="/"
          className="text-[11px] sm:text-sm font-black text-[var(--k-hot)] hover:text-[var(--k-hot-2)] flex items-center gap-1.5 transition-colors"
        >
          <span>Tüm Markaları İncele</span>
          <ArrowRight size={14} className="sm:w-4 sm:h-4" />
        </Link>
      </div>

      {/* MOBİL İÇİN KULLANIŞLI KOMPAKT KARTLAR (min-h-[120px]) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        {BRANDS.map((b) => (
          <Link
            key={b.name}
            href={b.link}
            className={`k-on-dark group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${b.bg} border ${b.border} p-4 sm:p-8 shadow-md hover:shadow-2xl hover:border-[var(--k-hot-deep)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[125px] sm:min-h-[300px] select-none`}
          >
            {/* Karanlık Degrade Katmanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--k-void)] via-[var(--k-void)] to-transparent z-10" />

            <div className="relative z-20 flex items-center justify-between gap-2">
              <h4 className={`text-xl sm:text-4xl font-black ${b.accent} group-hover:text-[var(--k-hot)] transition-colors tracking-tight drop-shadow-md`}>
                {b.name}
              </h4>
              <span className="text-[9px] sm:text-xs font-extrabold text-[var(--k-hot-2)] bg-[var(--k-hot-deep)] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[var(--k-hot-deep)]/30 backdrop-blur-xs">
                {b.count}
              </span>
            </div>

            <div className="relative z-20 flex items-center justify-between pt-2 sm:pt-8 border-t border-[var(--k-line-2)] mt-2 sm:mt-0">
              <span className="text-xs sm:text-sm font-black text-white group-hover:text-[var(--k-hot)] transition-colors">
                İlanları Gör
              </span>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[var(--k-surface)] border border-[var(--k-line)] shadow-md flex items-center justify-center text-[var(--k-ink)] group-hover:bg-[var(--k-hot)] group-hover:text-white group-hover:border-[var(--k-hot-deep)] transition-all">
                <ArrowRight size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
              </div>
            </div>

            {/* Arka plan 3D Logo + Telefon Görseli */}
            <div className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-65 transition-opacity duration-500 pointer-events-none">
              <img src={b.img} alt={b.name} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
