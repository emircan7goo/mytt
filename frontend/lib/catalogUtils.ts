/**
 * lib/catalogUtils.ts
 * Katalog modülünde paylaşılan saf yardımcı fonksiyonlar (backend'deki
 * catalog.service.ts'ten birebir taşındı).
 */

export const GRADE_RANK: Record<string, number> = { 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };

/**
 * "En hatasız / en güzel" sıralaması için kozmetik durum karşılaştırıcısı.
 * a, b'den daha iyi durumdaysa pozitif, kötüyse negatif, eşitse 0 döner.
 * Önce grade (A+ > A > B > C), eşitlikte pil sağlığı yüksek olan kazanır.
 */
export function compareCondition(
  a: { grade: string; batteryHealth?: number | null },
  b: { grade: string; batteryHealth?: number | null },
): number {
  const rankDiff = (GRADE_RANK[a.grade] ?? 0) - (GRADE_RANK[b.grade] ?? 0);
  if (rankDiff !== 0) return rankDiff;
  return (a.batteryHealth ?? 0) - (b.batteryHealth ?? 0);
}

/** "256GB" → 256, "1TB" → 1024 — depolama seçeneklerini büyükten/küçükten sıralamak için. */
export function storageToGB(s: string | null | undefined): number {
  if (!s) return 0;
  const m = s.match(/([\d.]+)\s*(GB|TB)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2].toUpperCase() === 'TB' ? n * 1024 : n;
}
