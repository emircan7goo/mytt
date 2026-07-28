'use client';
import Link from 'next/link';
import { ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';

const BRANDS = [
  {
    name: 'Apple iPhone',
    logo: '',
    tag: 'TSE Garantili',
    count: '240+ İlan',
    bg: 'from-orange-50/80 via-white to-amber-50/60',
    border: 'border-orange-200/80',
    accent: 'text-slate-900',
    badgeCls: 'bg-orange-600 text-white',
    link: '/?brand=Apple',
    img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&fit=crop&q=80',
  },
  {
    name: 'Samsung Galaxy',
    logo: 'SAMSUNG',
    tag: 'Galaxy AI Destekli',
    count: '180+ İlan',
    bg: 'from-amber-50/80 via-white to-orange-50/60',
    border: 'border-amber-200/80',
    accent: 'text-slate-900',
    badgeCls: 'bg-amber-600 text-white',
    link: '/?brand=Samsung',
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&fit=crop&q=80',
  },
  {
    name: 'Xiaomi & Redmi',
    logo: 'XIAOMI',
    tag: 'Fiyat / Performans',
    count: '120+ İlan',
    bg: 'from-orange-100/50 via-white to-orange-50/60',
    border: 'border-orange-200/80',
    accent: 'text-slate-900',
    badgeCls: 'bg-orange-700 text-white',
    link: '/?brand=Xiaomi',
    img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&fit=crop&q=80',
  },
];

export default function BrandHubShowcase() {
  return (
    <div className="w-full my-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-extrabold text-orange-600 tracking-wider uppercase">MARKA VİTRİNİ</span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Öne Çıkan <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">Doğrulanmış Markalar</span>
          </h3>
        </div>
        <Link
          href="/"
          className="text-xs font-extrabold text-orange-600 hover:text-orange-800 flex items-center gap-1.5 transition-colors"
        >
          <span>Tüm Markaları İncele</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BRANDS.map((b) => (
          <Link
            key={b.name}
            href={b.link}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${b.bg} border ${b.border} p-6 shadow-sm hover:shadow-xl hover:border-orange-400 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between min-h-[220px]`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs ${b.badgeCls}`}>
                  {b.tag}
                </span>
                <span className="text-[11px] font-bold text-orange-800/80">{b.count}</span>
              </div>

              <h4 className={`text-2xl font-black ${b.accent} mt-4 group-hover:text-orange-600 transition-colors`}>
                {b.name}
              </h4>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-orange-200/60">
              <span className="text-xs font-extrabold text-slate-700 group-hover:text-orange-600 transition-colors">
                İlanları Gör
              </span>
              <div className="w-8 h-8 rounded-full bg-white border border-orange-200 shadow-xs flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all">
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Arka plan görsel geçişi */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none">
              <img src={b.img} alt={b.name} className="w-full h-full object-cover object-center" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
