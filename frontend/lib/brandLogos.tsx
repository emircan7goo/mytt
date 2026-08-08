import React from 'react';

/**
 * Clean SVG Brand Logos for sidebar & brand showcases
 */
export const BRAND_LOGOS: Record<string, (props: { className?: string; size?: number }) => React.JSX.Element> = {
  Apple: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.15 1.86-1.01 2.96 1.07.08 2.17-.55 2.83-1.36z"/>
    </svg>
  ),
  Samsung: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 12.5c-.8.8-2.3 1.2-4.5 1.2-3.5 0-5.2-1.2-5.4-3.1h2.2c.2.8 1.2 1.2 3.1 1.2 1.4 0 2.3-.3 2.3-.9 0-.5-.5-.7-2.1-.9l-1.5-.2c-2.3-.3-3.6-1.1-3.6-2.8 0-1.7 1.6-3 4.6-3 3 0 4.8 1.1 5 2.8h-2.2c-.2-.7-1.1-1-2.7-1-1.3 0-2.2.3-2.2.8 0 .4.4.6 1.8.8l1.6.2c2.4.3 3.6 1.2 3.6 2.9 0 1.2-.7 2.1-2 2.7z"/>
    </svg>
  ),
  Xiaomi: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 4h16v16H4V4zm4 4v8h2v-6h2v6h2V8H8zm8 0h-2v8h2V8z"/>
    </svg>
  ),
  Realme: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 6h16v3H7v3h10v3H7v3H4V6z"/>
    </svg>
  ),
  Oppo: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 8c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 7.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm10-7.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 7.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  ),
  Huawei: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2L9.5 8h5L12 2zm-5 4l-4 6h5l-1-6zm10 0l-1 6h5l-4-6zm-11 7l-4 5h5l-1-5zm12 0l-1 5h5l-4-5zm-7 1l-1.5 5h3L12 14z"/>
    </svg>
  ),
  Vivo: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 7l4 10h2L5 7H3zm7 0l4 10h2l4-10h-2l-3 7.5L12 7h-2z"/>
    </svg>
  ),
  Honor: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 13a5 5 0 110-10 5 5 0 010 10z"/>
    </svg>
  ),
  Nothing: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="12" cy="12" r="2"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
    </svg>
  ),
  Poco: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 6h6c2.2 0 4 1.8 4 4s-1.8 4-4 4H7v4H4V6zm3 3v3h3c.55 0 1-.45 1-1s-.45-1-1-1H7zm11-3h-3v12h3V6z"/>
    </svg>
  ),
  Infinix: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6 6h3v12H6V6zm9 0h3v12h-3V6zm-4.5 4.5h3v3h-3v-3z"/>
    </svg>
  ),
  Tecno: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 6h18v3h-7.5v9h-3V9H3V6z"/>
    </svg>
  ),
  Casper: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 4a8 8 0 00-8 8c0 3 1.5 5.5 4 7v1h8v-1c2.5-1.5 4-4 4-7a8 8 0 00-8-8zm-2 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
    </svg>
  ),
  Omix: ({ className = "w-4 h-4", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 5a7 7 0 100 14 7 7 0 000-14zm0 11a4 4 0 110-8 4 4 0 010 8z"/>
    </svg>
  ),
};

export function getBrandLogo(brandName: string, size = 16, className = "w-4 h-4") {
  const norm = normalizeBrandName(brandName);
  const Logo = BRAND_LOGOS[norm];
  if (Logo) return <Logo size={size} className={className} />;
  return (
    <span className="font-black text-[10px] uppercase">
      {norm.slice(0, 2)}
    </span>
  );
}

export function normalizeBrandName(b: string): string {
  const s = (b || '').toLowerCase().trim();
  if (s.startsWith('apple') || s.startsWith('iphone')) return 'Apple';
  if (s.startsWith('samsung')) return 'Samsung';
  if (s.includes('xiaomi') || s.includes('redmi')) return 'Xiaomi';
  if (s.includes('poco')) return 'Poco';
  if (s.includes('oppo')) return 'Oppo';
  if (s.includes('realme')) return 'Realme';
  if (s.includes('huawei')) return 'Huawei';
  if (s.includes('vivo')) return 'Vivo';
  if (s.includes('honor')) return 'Honor';
  if (s.includes('infinix')) return 'Infinix';
  if (s.includes('tecno')) return 'Tecno';
  if (s.includes('nothing')) return 'Nothing';
  if (s.includes('casper')) return 'Casper';
  if (s.includes('omix')) return 'Omix';
  return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
}
