'use client';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';
import { getBuilderPreview, subscribeBuilderPreview } from '@/lib/builder-preview';
import { useState, useEffect } from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';

export default function GodLevelOverlay() {
  const { data } = useSiteConfig();
  const [, forceRender] = useState(0);
  // SSR hydration fix: client-only render (WhatsApp butonu server'da render edilmemeli)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return subscribeBuilderPreview(() => forceRender(n => n + 1));
  }, []);

  const preview = getBuilderPreview();
  const settings = preview ?? data?.settings;

  // Server'da ve ilk client render'da null döndür → hydration mismatch yok
  if (!mounted || !settings) return null;

  return (
    <>
      {/* 17. Maintenance Mode */}
      {settings.maintenanceMode && (
        <div className="fixed inset-0 z-[9999] bg-[var(--k-void)] flex flex-col items-center justify-center text-white">
          <AlertCircle size={64} className="text-orange-500 mb-6 animate-pulse" />
          <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-4">Mola Verdik!</h1>
          <p className="text-white/60 max-w-md text-center text-lg">
            Gördüğünüz üzere muazzam bir güncelleme yapıyoruz. En kısa sürede en iyi fiyata yenilenmiş telefonlarla döneceğiz.
          </p>
        </div>
      )}

      {/* 11. Floating WhatsApp */}
      {settings.floatingWhatsApp && settings.whatsappNumber && !settings.maintenanceMode && (
        <a 
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform hover:shadow-[0_12px_40px_rgba(37,211,102,0.6)]"
          aria-label="WhatsApp Destek"
        >
          <MessageCircle size={28} />
          {/* Notification Ping */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        </a>
      )}
    </>
  );
}
