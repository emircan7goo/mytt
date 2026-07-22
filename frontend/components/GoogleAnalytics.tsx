'use client';
/**
 * GoogleAnalytics.tsx
 *
 * GA4 entegrasyonu — KVKK / Consent Mode v2 uyumlu.
 *
 * - GA script'i yalnızca env'de NEXT_PUBLIC_GA_ID tanımlıysa yüklenir.
 * - Başlangıçta analytics_storage: 'denied' (rıza yok) olarak ayarlanır.
 * - CookieConsent bileşeni "Tümünü Kabul Et" seçilince gtag('consent','update')
 *   çağırarak storage'ı 'granted' yapar.
 *
 * Kurulum:
 *   .env.local veya .env.prod'a şunu ekle:
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 */
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* GA4 script yükle */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* Consent Mode v2 — önce 'denied', CookieConsent kabul edince 'granted' */}
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Consent Mode v2 — varsayılan KVKK uyumlu ayar
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500,
          });

          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: false,  // consent onaylanana kadar sayfa görüntülemesi gönderme
          });
        `}
      </Script>
    </>
  );
}
