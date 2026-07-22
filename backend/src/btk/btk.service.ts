import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class BtkService {
  /**
   * Validates IMEI check-digit using the Luhn algorithm
   */
  validateLuhn(imei: string): boolean {
    if (!/^\d{15}$/.test(imei)) return false;

    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(imei.charAt(i), 10);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
    }
    return sum % 10 === 0;
  }

  /**
   * Performs BTK registration check (Luhn validation + mock registry checks)
   */
  validateImei(imei: string): void {
    if (!imei) {
      return; // Skip validation if optional field is empty
    }

    // 1. Check format & Luhn validity
    if (!this.validateLuhn(imei)) {
      throw new BadRequestException('Geçersiz IMEI numarası. Lütfen 15 haneli geçerli bir IMEI girin.');
    }

    // 2. Check mock stolen/unregistered status (if IMEI ends with '000')
    if (imei.endsWith('000')) {
      throw new BadRequestException('Bu cihaz BTK veritabanında ÇALINTI veya Klonlanmış olarak kayıtlıdır. Listelenemez.');
    }
  }
}
