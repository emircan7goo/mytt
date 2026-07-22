/**
 * lib/analytics.ts
 * GA4 event tracking yardımcı fonksiyonları.
 * gtag mevcut değilse sessizce geçer (SSR / GA yüklenmemişse).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ── Sayfa Görüntüleme ─────────────────────────────────────────────────────────
export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: url });
}

// ── Ürün Görüntüleme (view_item) ─────────────────────────────────────────────
export function trackViewItem(product: {
  id: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'view_item', {
    currency: 'TRY',
    value: product.price,
    items: [{
      item_id:       product.id,
      item_name:     `${product.brand} ${product.model}`,
      item_brand:    product.brand,
      item_category: product.condition === 'NEW' ? 'Sıfır' : 'Yenilenmiş',
      price:         product.price,
      quantity:      1,
    }],
  });
}

// ── Sepete Ekle (add_to_cart) ─────────────────────────────────────────────────
export function trackAddToCart(product: {
  id: string;
  brand: string;
  model: string;
  price: number;
}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'add_to_cart', {
    currency: 'TRY',
    value: product.price,
    items: [{
      item_id:   product.id,
      item_name: `${product.brand} ${product.model}`,
      price:     product.price,
      quantity:  1,
    }],
  });
}

// ── Ödeme Başlatma (begin_checkout) ──────────────────────────────────────────
export function trackBeginCheckout(amount: number, productName: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'begin_checkout', {
    currency: 'TRY',
    value:    amount,
    items: [{ item_name: productName, price: amount, quantity: 1 }],
  });
}

// ── Satın Alma Tamamlandı (purchase) ─────────────────────────────────────────
export function trackPurchase(orderId: string, amount: number) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'purchase', {
    transaction_id: orderId,
    currency:       'TRY',
    value:          amount,
  });
}

// ── Kayıt / Giriş ─────────────────────────────────────────────────────────────
export function trackSignUp(method = 'email') {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'sign_up', { method });
}

export function trackLogin(method = 'email') {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', 'login', { method });
}
