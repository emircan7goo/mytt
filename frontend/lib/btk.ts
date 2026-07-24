/**
 * lib/btk.ts — IMEI doğrulama (Luhn algoritması)
 * (backend/src/btk/btk.service.ts'ten taşındı)
 * NOT: "stolen registry" kontrolü gerçek bir BTK entegrasyonu DEĞİL, mock —
 * IMEI '000' ile bitiyorsa reddediyor (orijinal koddaki davranış).
 */
export function validateLuhn(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** Geçersizse mesajı döner, geçerliyse (veya boşsa) null döner. */
export function validateImei(imei?: string | null): string | null {
  if (!imei) return null;
  if (!validateLuhn(imei)) return 'Geçersiz IMEI numarası. Lütfen 15 haneli geçerli bir IMEI girin.';
  if (imei.endsWith('000')) return 'Bu cihaz BTK veritabanında ÇALINTI veya Klonlanmış olarak kayıtlıdır. Listelenemez.';
  return null;
}
