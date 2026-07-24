/**
 * lib/mail.ts — Transactional Email
 * (backend/src/mail/mail.service.ts'ten taşındı)
 *
 * Tüm email gönderimi tek bir `send()` fonksiyonundan geçer: önce SMTP
 * (Gmail vb.) dener, yoksa Resend, o da yoksa konsola loglar — uygulama
 * hiçbir zaman email hatasıyla çökmez.
 *
 * Not: Sipariş/bayi/satış-talebi email şablonları henüz taşınmadı — bu
 * modüller (Order, Admin, SellRequests) Next.js'e taşınırken buraya
 * eklenecek. Şimdilik sadece Auth fazının ihtiyaç duyduğu iki şablon var.
 */
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend   = new Resend(process.env.RESEND_API_KEY);
const from     = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
const siteName = 'Mytt';
const siteUrl  = process.env.FRONTEND_URL ?? 'http://localhost:3000';

const smtpTransport = (() => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER ?? process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS ?? process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: host ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
})();

async function send(to: string, subject: string, html: string): Promise<void> {
  if (smtpTransport) {
    try {
      const fromName = `${siteName} <${process.env.SMTP_USER ?? process.env.GMAIL_USER}>`;
      await smtpTransport.sendMail({ from: fromName, to, subject, html });
      console.log(`✉️  SMTP ile gönderildi → ${to}`);
      return;
    } catch (err: any) {
      console.error(`SMTP hatası (${to}): ${err?.message}`);
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.log(`[MAIL STUB] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: `${siteName} <${from}>`,
      to: [to],
      subject,
      html,
    });
    if (error) console.error(`Resend hatası (${to}): ${JSON.stringify(error)}`);
    else console.log(`✉️  Email gönderildi → ${to} | ${subject}`);
  } catch (err: any) {
    console.error(`Email gönderilemedi (${to}): ${err?.message}`);
  }
}

export async function sendVerificationCode(opts: { email: string; name: string; code: string }): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n${'═'.repeat(50)}\n🔑  OTP KODU  |  ${opts.email}\n    KOD: ${opts.code}\n${'═'.repeat(50)}`);
  }
  const digits = opts.code.split('').map(d =>
    `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:28px;font-weight:900;color:#18181b;background:#f4f4f5;border-radius:10px;margin:0 3px;font-family:monospace,monospace">${d}</span>`
  ).join('');
  await send(
    opts.email,
    `${opts.code} — ${siteName} Doğrulama Kodunuz`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:36px 32px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:24px">
          <span style="font-size:28px;font-weight:900;color:#18181b;letter-spacing:-1px">my<span style="color:#f97316">tt</span></span>
        </div>
        <h2 style="color:#18181b;margin:0 0 8px;font-size:20px;font-weight:800;text-align:center">E-posta Doğrulama Kodu</h2>
        <p style="color:#71717a;margin:0 0 28px;font-size:14px;line-height:1.6;text-align:center">
          Merhaba <strong style="color:#18181b">${opts.name}</strong>, hesabınızı doğrulamak için aşağıdaki 6 haneli kodu girin.
        </p>
        <div style="text-align:center;margin:0 0 28px;padding:20px;background:#fafafa;border-radius:12px;border:1px solid #e2e8f0">
          ${digits}
        </div>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin-bottom:20px">
          <p style="margin:0;font-size:12px;color:#9a3412;line-height:1.6">
            ⏰ <strong>Bu kod 15 dakika geçerlidir.</strong> Süresi dolmadan girin.<br>
            Bu işlemi siz yapmadıysanız bu emaili dikkate almayın.
          </p>
        </div>
        <p style="color:#a1a1aa;font-size:11px;margin:0;text-align:center">
          ${siteName} · Güvenli Alışveriş · <a href="${siteUrl}" style="color:#a1a1aa">mytt.com.tr</a>
        </p>
      </div>
    </div>`,
  );
}

export async function sendOrderConfirmation(opts: {
  buyerEmail: string;
  buyerName: string;
  orderId: string;
  productName: string;
  amount: number;
}): Promise<void> {
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  await send(
    opts.buyerEmail,
    `Siparişiniz Alındı — #${shortId}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Siparişiniz Alındı ✅</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.buyerName}</strong>, ödemeniz başarıyla gerçekleşti.</p>

        <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:1px">Sipariş No</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#18181b;font-family:monospace">#${shortId}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:12px 0;color:#71717a;font-size:14px">Ürün</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;color:#18181b;font-size:14px">${opts.productName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0">
            <td style="padding:12px 0;color:#71717a;font-size:14px">Tutar</td>
            <td style="padding:12px 0;text-align:right;font-weight:700;color:#18181b;font-size:16px">${opts.amount.toLocaleString('tr-TR')} ₺</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#71717a;font-size:14px">Durum</td>
            <td style="padding:12px 0;text-align:right">
              <span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:99px;font-size:12px;font-weight:700">Escrow'da Güvende</span>
            </td>
          </tr>
        </table>

        <div style="background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.6">
            🛡️ <strong>Escrow Güvencesi:</strong> Ödemeniz bayi teslimatı onaylayana kadar güvence altında tutulmaktadır.
          </p>
        </div>

        <a href="${siteUrl}/hesabim"
           style="display:block;background:#18181b;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Siparişimi Takip Et
        </a>
      </div>
      <p style="text-align:center;color:#a1a1aa;font-size:12px;margin-top:24px">${siteName} • Güvenli Alışveriş</p>
    </div>`,
  );
}

export async function sendNewOrderNotification(opts: {
  dealerEmail: string;
  dealerName: string;
  orderId: string;
  productName: string;
  quantity: number;
  amount: number;
}): Promise<void> {
  const shortId = opts.orderId.slice(0, 8).toUpperCase();
  await send(
    opts.dealerEmail,
    `Yeni Sipariş — #${shortId}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Yeni Sipariş Geldi 📦</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.dealerName}</strong>, bir müşteri ürününüzü satın aldı.</p>

        <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase">Sipariş #${shortId}</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#18181b">${opts.productName}</p>
          <p style="margin:4px 0 0;color:#71717a;font-size:14px">Adet: ${opts.quantity}</p>
        </div>

        <div style="display:flex;justify-content:space-between;background:#ecfdf5;border-radius:12px;padding:16px;margin-bottom:24px">
          <span style="color:#166534;font-size:14px;font-weight:600">Kazancınız</span>
          <span style="color:#166534;font-size:20px;font-weight:700">${(opts.amount * 0.95).toLocaleString('tr-TR')} ₺</span>
        </div>

        <a href="${siteUrl}/dealer/orders"
           style="display:block;background:#18181b;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Siparişi Görüntüle ve Onayla
        </a>
      </div>
    </div>`,
  );
}

export async function sendPasswordReset(opts: { email: string; name: string; resetUrl: string }): Promise<void> {
  await send(
    opts.email,
    `Şifre Sıfırlama — ${siteName}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Şifre Sıfırlama</h2>
        <p style="color:#71717a;margin:0 0 24px">
          Merhaba <strong>${opts.name}</strong>, şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın.
          Bu bağlantı <strong>1 saat</strong> geçerlidir.
        </p>
        <a href="${opts.resetUrl}"
           style="display:block;background:#18181b;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px;margin-bottom:16px">
          Şifremi Sıfırla
        </a>
        <p style="color:#a1a1aa;font-size:12px;margin:0">
          Bu isteği siz yapmadıysanız bu emaili görmezden gelin. Şifreniz değişmeyecektir.
        </p>
      </div>
    </div>`,
  );
}
