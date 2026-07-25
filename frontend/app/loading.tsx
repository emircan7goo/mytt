/**
 * Root loading.tsx — Sayfa geçişlerinde otomatik Suspense fallback'i.
 * Next.js bu dosyayı page.tsx'leri <Suspense> ile sarar.
 * Server Component (zero JS bundle).
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #13152a 0%, #0a0d18 100%)',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated ring spinner */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: '3px solid transparent',
              borderTopColor: '#EA580C',
              borderRightColor: '#EA580C',
            }}
          />
          <div
            className="absolute inset-[6px] rounded-full animate-spin"
            style={{
              border: '2px solid transparent',
              borderBottomColor: '#FB923C',
              animationDirection: 'reverse',
              animationDuration: '0.8s',
            }}
          />
        </div>

        <p className="text-[13px] text-white/30 font-medium tracking-wide">
          Mytt
        </p>
      </div>
    </div>
  );
}
