/**
 * resolveUploadUrl — Domain-bağımsız görsel URL çözücü
 *
 * Veritabanında üç farklı URL formatı olabilir:
 *   1. Eski geliştirme verileri  → "http://localhost:3001/uploads/foo.png"
 *   2. Yeni göreceli yol         → "/uploads/foo.png"
 *   3. Harici URL                → "https://brand.samsung.com/logo.svg"
 *
 * Bu fonksiyon hepsini doğru çalıştırır; domain değiştiğinde
 * veritabanı güncellemeye gerek kalmaz.
 */

import { API_BASE } from './api';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjY2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HTag4YiBZw7xrbGVuaXlvcjwvdGV4dD48L3N2Zz4=';

export function resolveUploadUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return PLACEHOLDER_IMAGE;

  try {
    const trimmed = url.trim();

    // ── Data URI (base64 encoded image) — olduğu gibi bırak ──────────────
    if (trimmed.startsWith('data:')) return trimmed;

    // ── Blob URL — olduğu gibi bırak ─────────────────────────────────────
    if (trimmed.startsWith('blob:')) return trimmed;

    // ── CSS Gradient / Hex renk — görsel değil ama crash yapmasın ────────
    if (
      trimmed.startsWith('linear-gradient') ||
      trimmed.startsWith('radial-gradient') ||
      trimmed.startsWith('conic-gradient') ||
      /^#[0-9a-fA-F]{3,8}$/.test(trimmed)
    ) {
      // Bu değerler <img src> için geçersiz olur ama crash olmasın
      // Gradient'ler background olarak kullanılmalı, burada placeholder dön
      return PLACEHOLDER_IMAGE;
    }

    // ── Harici URL (başka bir domain) — olduğu gibi bırak ────────────────
    const isExternal =
      trimmed.startsWith('http') &&
      !trimmed.includes('localhost') &&
      !trimmed.startsWith(API_BASE);
    if (isExternal) return trimmed;

    // ── Göreceli yol "/uploads/..." — Proxy üzerinden çalışması için aynen bırak ──
    if (trimmed.startsWith('/uploads/')) return trimmed;

    // ── Eski "localhost" veya API_BASE barındıran tam URL'leri göreceli yola çevir ──
    // Iframe içerisindeki CORS ve third-party context hatalarını Next.js rewrite 
    // proxy'si sayesinde aşmak için tüm upload'ları same-origin hale getiriyoruz.
    if (/^https?:\/\/.*\/uploads\//.test(trimmed)) {
      return trimmed.replace(/^https?:\/\/.*\/uploads\//, '/uploads/');
    }

    return trimmed;
  } catch {
    // Malformed URL → sessizce placeholder döndür, crash yapma
    return PLACEHOLDER_IMAGE;
  }
}
