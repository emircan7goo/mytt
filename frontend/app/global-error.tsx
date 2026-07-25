'use client';
/**
 * global-error.tsx — Root layout içindeki kritik hatalar için.
 * Bu dosya kendi html+body'sini render etmek ZORUNDA (layout bypass edilir).
 * Normal error.tsx'ten farkı: Navbar/Provider çöktüğünde bile çalışır.
 */
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at top, #0f0a1a 0%, #08091a 100%)',
          color: '#e2e8f0',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 480 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>
            Kritik Sistem Hatası
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: '0 0 32px' }}>
            Platform beklenmeyen bir hatayla karşılaştı.
            {error.digest && (
              <span style={{ display: 'block', marginTop: 8, fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>
                ref: {error.digest}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg,#EA580C,#4f46e5)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Yeniden Dene
            </button>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              Anasayfa
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
