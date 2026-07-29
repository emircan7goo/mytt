'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

/**
 * RequireRole — Client-side RBAC guard (2. savunma katmanı)
 *
 * 1. savunma: middleware.ts (Edge, cookie tabanlı)
 * 2. savunma: Bu bileşen (client, Zustand tabanlı)
 *
 * Flash bug düzeltildi:
 *   - Eski: ilk render'da auth kontrol atlanıyordu → admin içeriği anlık görünüyordu
 *   - Yeni: hydrate olana kadar tam ekran spinner, sonra anında redirect
 */
export default function RequireRole({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Zustand persist localStorage'dan yüklenir — bir tick bekle
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!user) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.replace(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }

    if (user.role?.toLowerCase() !== role.toLowerCase()) {
      router.replace('/403');
    }
  }, [hydrated, user, role, router]);

  // Hydrate olmadan hiçbir şey render etme
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08091200' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--k-hot-deep)]/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-[var(--k-ink-3)] text-xs">Oturum doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı yok veya yanlış rol → boş döndür (useEffect redirect'i halleder)
  if (!user || user.role?.toLowerCase() !== role.toLowerCase()) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#08091200' }}>
        <div className="w-8 h-8 border-2 border-[var(--k-hot-deep)]/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
