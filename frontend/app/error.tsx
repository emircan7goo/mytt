'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Root error.tsx — Route segment runtime hatalarını yakalar.
 * Next.js 16.2+: `unstable_retry` ile segment'i yeniden fetch + render eder.
 * 'reset' eski API — tercih edilen `unstable_retry`.
 */
export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Dev'de detay, prod'da sadece digest log'lanır.
    // TODO: Sentry/Datadog/Axiom entegrasyonu gelince buraya eklenecek.
    console.error('[RouteError]', error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans"
      style={{
        background:
          'radial-gradient(ellipse at top, #2a1220 0%, #0a0d18 55%, #08091a 100%)',
        color: '#e2e8f0',
      }}
    >
      {/* Decorative red glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }}
      />

      <div className="relative z-10 text-center px-6 max-w-xl">
        {/* Icon */}
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center border border-red-500/30"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.05))',
            boxShadow: '0 0 60px rgba(239,68,68,0.25)',
          }}
        >
          <AlertTriangle size={34} className="text-red-400" strokeWidth={2} />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Bir şeyler ters gitti
        </h1>
        <p className="text-sm md:text-base text-white/50 mt-3 leading-relaxed max-w-md mx-auto">
          Beklenmeyen bir hata oluştu. Bu durumu kaydettik, en kısa sürede
          inceleyeceğiz. Tekrar denemek ister misiniz?
        </p>

        {/* Error detail — sadece dev'de ya da digest varsa */}
        {(isDev || error.digest) && (
          <div className="mt-5 mx-auto max-w-md p-3 rounded-lg border border-red-500/20 bg-red-500/[0.06] text-left">
            {isDev && error.message && (
              <p className="text-[11px] text-red-300/90 font-mono break-words">
                {error.message}
              </p>
            )}
            {error.digest && (
              <p className="text-[10px] text-white/30 font-mono mt-1">
                ref: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <button
            onClick={() => unstable_retry()}
            className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-purple-900/40 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500" />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white/80 text-sm font-bold border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all"
          >
            <Home size={15} />
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
