'use client';
/**
 * (public)/error.tsx — Public route grubu segment hatası.
 * Navbar + Footer görünür kalır, sadece content alanı hata gösterir.
 */
import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PublicRouteError]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-[var(--k-ink)] mb-2 tracking-tight">
          Bir şeyler ters gitti
        </h1>
        <p className="text-[var(--k-ink-3)] text-sm leading-relaxed mb-2">
          Bu sayfayı yüklerken bir hata oluştu. Lütfen tekrar deneyin.
        </p>

        {error.digest && (
          <p className="text-[11px] text-[var(--k-ink-4)] font-mono mb-6">
            ref: {error.digest}
          </p>
        )}

        {process.env.NODE_ENV !== 'production' && error.message && (
          <pre className="text-[11px] text-left text-red-500 bg-red-50 border border-red-100 rounded-xl p-3 mb-6 overflow-auto max-h-28">
            {error.message}
          </pre>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--k-canvas)] text-white text-sm font-bold hover:bg-[var(--k-void)] transition-colors"
          >
            <RefreshCw size={14} />
            Tekrar Dene
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--k-line)] text-[var(--k-ink-2)] text-sm font-bold hover:bg-[var(--k-surface-2)] transition-colors"
          >
            <Home size={14} />
            Vitrine Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
