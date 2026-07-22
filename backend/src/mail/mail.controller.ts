/**
 * MailController — Geliştirici test endpoint'leri
 *
 * GET /mail/test?to=...  →  Belirtilen adrese test maili gönderir
 *
 * ⚠️  Bu endpoint yalnızca development ortamında açıktır.
 *     Production'da NODE_ENV=production olarak ayarlayın.
 */
import { Controller, Get, Query, BadRequestException, ForbiddenException } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mail: MailService) {}

  /**
   * GET /mail/test?to=telefonmuhendisi.iletisim@gmail.com
   *
   * Sadece development ortamında çalışır.
   * Belirtilen adrese "mytt Test Maili" gönderir.
   */
  @Get('test')
  async sendTestMail(@Query('to') to: string) {
    // Production'da devre dışı
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Test endpoint production ortamında devre dışıdır.');
    }

    if (!to || !to.includes('@')) {
      throw new BadRequestException('Geçerli bir "to" email adresi gerekli. Örnek: /mail/test?to=siz@ornek.com');
    }

    const result = await this.mail.sendTestMail(to);

    if (!result.ok) {
      return {
        success: false,
        message: `Email gönderilemedi: ${result.error}`,
        to,
      };
    }

    return {
      success: true,
      message: `✅ Test maili gönderildi!`,
      to,
      subject: 'mytt Test Maili',
      from:    process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    };
  }
}
