import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sayfa Bulunamadı — 404',
  description: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
};

/**
 * Root not-found.tsx — Tüm eşleşmeyen URL'ler için 404 sayfası.
 * Server Component (zero JS). Link'ler prefetch olur, nav hızlı.
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans"
      style={{
        background:
          'radial-gradient(ellipse at top, #1a1d2e 0%, #0a0d18 50%, #08091a 100%)',
        color: '#e2e8f0',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EA580C 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-xl animate-fade-in">
        {/* Giant 404 */}
        <div
          className="text-[160px] md:text-[220px] font-black leading-none tracking-tighter select-none"
          style={{
            background:
              'linear-gradient(135deg, #FB923C 0%, #EA580C 40%, #4f46e5 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 60px rgba(234,88,12,0.35))',
          }}
        >
          404
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mt-2 tracking-tight">
          Bu sayfa kayıplara karıştı
        </h1>
        <p className="text-sm md:text-base text-white/50 mt-3 leading-relaxed">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          <br className="hidden md:block" />
          Aşağıdaki bağlantılardan devam edebilirsiniz.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-indigo-900/40 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#EA580C,#4f46e5)' }}
          >
            <Home size={16} />
            Anasayfaya Dön
          </Link>
          <Link
            href="/?search=1"
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white/80 text-sm font-bold border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all backdrop-blur-sm"
          >
            <Search size={16} />
            Ürün Ara
          </Link>
        </div>

        {/* Tiny link */}
        <div className="mt-10 flex items-center justify-center gap-1.5 text-[12px] text-white/30">
          <ArrowLeft size={11} />
          <span>
            Önceki sayfaya dönmek için tarayıcının geri tuşunu kullanabilirsiniz
          </span>
        </div>
      </div>
    </div>
  );
}
