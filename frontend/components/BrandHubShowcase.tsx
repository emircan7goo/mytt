'use client';
import Link from 'next/link';
import { ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';

const BRANDS = [
  {
    name: 'Apple iPhone',
    logo: '',
    tag: 'TSE 12 Ay Garantili',
    count: '240+ İlan',
    bg: 'from-slate-900 via-slate-950 to-slate-900 text-white',
    border: 'border-slate-800',
    accent: 'text-white',
    badgeCls: 'bg-white text-slate-950 font-black',
    link: '/?brand=Apple',
    img: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&fit=crop&q=80',
  },
  {
    name: 'Samsung Galaxy',
    logo: 'SAMSUNG',
    tag: 'Galaxy AI Destekli',
    count: '180+ İlan',
    bg: 'from-blue-50 via-white to-indigo-50/60 text-slate-900',
    border: 'border-blue-200/80',
    accent: 'text-slate-900',
    badgeCls: 'bg-blue-600 text-white',
    link: '/?brand=Samsung',
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&fit=crop&q=80',
  },
  {
    name: 'Xiaomi & Redmi',
    logo: 'XIAOMI',
    tag: 'Fiyat / Performans',
    count: '120+ İlan',
    bg: 'from-amber-50 via-white to-orange-50/60 text-slate-900',
    border: 'border-amber-200/80',
    accent: 'text-slate-900',
    badgeCls: 'bg-amber-600 text-white',
    link: '/?brand=Xiaomi',
    img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&fit=crop&q=80',
  },
];

export default function BrandHubShowcase() {
  return (
    <div className="w-full my-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-black text-blue-600 tracking-widest uppercase">MARKA VİTRİNİ</span>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1.5 tracking-tight">
            Öne Çıkan <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">Yenilenmiş Telefon Markaları</span>
          </h3>
        </div>
        <Link
          href="/"
          className="text-sm font-black text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors"
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
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${b.bg} border ${b.border} p-8 shadow-md hover:shadow-2xl hover:border-blue-400 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between min-h-[260px] md:min-h-[280px]`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-full shadow-xs ${b.badgeCls}`}>
                  {b.tag}
                </span>
                <span className="text-xs font-extrabold text-slate-400">{b.count}</span>
              </div>

              <h4 className={`text-3xl font-black ${b.accent} mt-6 group-hover:text-blue-500 transition-colors tracking-tight`}>
                {b.name}
              </h4>
            </div>

            <div className="relative z-10 flex items-center justify-between pt-8 border-t border-slate-200/20">
              <span className="text-sm font-black group-hover:text-blue-400 transition-colors">
                Tüm İlanları Gör
              </span>
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                <ArrowRight size={16} strokeWidth={2.5} />
              </div>
            </div>

            {/* Arka plan görsel geçişi */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 group-hover:opacity-35 transition-opacity duration-500 pointer-events-none">
              <img src={b.img} alt={b.name} className="w-full h-full object-cover object-center" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
