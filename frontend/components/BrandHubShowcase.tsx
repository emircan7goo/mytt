'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BRANDS = [
  {
    name: 'iPhone',
    count: 'Güncel İlanlar',
    bg: 'from-slate-900 via-slate-950 to-slate-900 text-white',
    border: 'border-[var(--k-line)]',
    accent: 'text-white',
    link: '/?brand=Apple',
    img: '/brands/apple.jpg',
  },
  {
    name: 'Samsung',
    count: 'Güncel İlanlar',
    bg: 'from-orange-950 via-slate-950 to-amber-950 text-white',
    border: 'border-orange-900/60',
    accent: 'text-white',
    link: '/?brand=Samsung',
    img: '/brands/samsung.jpg',
  },
  {
    name: 'Xiaomi',
    count: 'Güncel İlanlar',
    bg: 'from-amber-950 via-slate-950 to-orange-900 text-white',
    border: 'border-amber-900/60',
    accent: 'text-white',
    link: '/?brand=Xiaomi',
    img: '/brands/xiaomi.jpg',
  },
];

export default function BrandHubShowcase() {
  return (
    <div className="w-full my-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-black text-orange-600 tracking-widest uppercase">MARKA VİTRİNİ</span>
          <h3 className="text-3xl sm:text-4xl font-black text-[var(--k-ink)] mt-1.5 tracking-tight">
            Öne Çıkan <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">Sıfır & Hatasız 2. El Markaları</span>
          </h3>
        </div>
        <Link
          href="/"
          className="text-sm font-black text-orange-600 hover:text-orange-800 flex items-center gap-2 transition-colors"
        >
          <span>Tüm Markaları İncele</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BRANDS.map((b) => (
          <Link
            key={b.name}
            href={b.link}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${b.bg} border ${b.border} p-8 shadow-md hover:shadow-2xl hover:border-orange-400 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between min-h-[280px] md:min-h-[300px]`}
          >
            {/* Karanlık Gradyan Katmanı */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />

            <div className="relative z-20">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-orange-200 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-500/30 backdrop-blur-xs">
                  {b.count}
                </span>
              </div>

              <h4 className={`text-4xl font-black ${b.accent} mt-8 group-hover:text-orange-400 transition-colors tracking-tight drop-shadow-lg`}>
                {b.name}
              </h4>
            </div>

            <div className="relative z-20 flex items-center justify-between pt-8 border-t border-white/20">
              <span className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                İlanları Gör
              </span>
              <div className="w-10 h-10 rounded-full bg-[var(--k-surface)] border border-[var(--k-line)] shadow-md flex items-center justify-center text-[var(--k-ink)] group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
                <ArrowRight size={16} strokeWidth={2.5} />
              </div>
            </div>

            {/* Arka plan 3D Logo + Telefon Görseli */}
            <div className="absolute inset-0 w-full h-full opacity-50 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none">
              <img src={b.img} alt={b.name} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
