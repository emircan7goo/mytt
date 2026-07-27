/**
 * Root loading.tsx — Sayfa geçişlerinde otomatik Suspense fallback'i.
 * Next.js bu dosyayı page.tsx'leri <Suspense> ile sarar.
 * Server Component (zero JS bundle).
 *
 * ATÖLYE: eskiden koyu radial zemin kullanıyordu; açık temada her sayfa
 * geçişinde karanlık bir flaş yaratıyordu. Artık krem kanvasla aynı.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--k-canvas)' }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Halka spinner */}
        <div className="relative w-11 h-11">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: '2.5px solid var(--k-line)',
              borderTopColor: 'var(--k-hot)',
              borderRightColor: 'var(--k-hot)',
            }}
          />
          <div
            className="absolute inset-[7px] rounded-full animate-spin"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'var(--k-hot-2)',
              animationDirection: 'reverse',
              animationDuration: '0.9s',
            }}
          />
        </div>

        <p className="k-label">Mytt</p>
      </div>
    </div>
  );
}
