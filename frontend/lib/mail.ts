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

const resend   = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from     = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
const siteName = 'Mytt';
const siteUrl  = process.env.FRONTEND_URL ?? 'http://localhost:3000';

const smtpTransport = (() => {
  const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
  const user = process.env.SMTP_USER ?? process.env.GMAIL_USER ?? 'mytt.iletisim@gmail.com';
  const rawPass = process.env.SMTP_PASS ?? process.env.GMAIL_APP_PASSWORD ?? 'rykj tusu ddtx vqev';
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user, pass },
  });
})();

async function send(to: string, subject: string, html: string): Promise<void> {
  if (smtpTransport) {
    try {
      const fromName = `${siteName} <${process.env.SMTP_USER ?? process.env.GMAIL_USER ?? 'mytt.iletisim@gmail.com'}>`;
      await smtpTransport.sendMail({ from: fromName, to, subject, html });
      console.log(`✉️  Gmail SMTP ile başarıyla gönderildi → ${to}`);
      return;
    } catch (err: any) {
      console.error(`Gmail SMTP hatası (${to}): ${err?.message}`);
    }
  }

  if (!resend) {
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
    console.log(`\n${'═'.repeat(50)}\n🔑  GMAIL SMTP OTP KODU  |  ${opts.email}\n    KOD: ${opts.code}\n${'═'.repeat(50)}`);
  }
  const digits = opts.code.split('').map(d =>
    `<span style="display:inline-block;width:44px;height:56px;line-height:56px;text-align:center;font-size:30px;font-weight:900;color:#f97316;background:#0f172a;border:2px solid #f97316;border-radius:12px;margin:0 4px;box-shadow:0 4px 12px rgba(249,115,22,0.2);font-family:Consolas,monospace">${d}</span>`
  ).join('');

  await send(
    opts.email,
    `🔑 ${opts.code} — MYTT E-posta Doğrulama Kodunuz`,
    `<div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;background:#090d16">
      <div style="background:#131927;border-radius:24px;padding:40px 32px;border:1px solid #1e293b;box-shadow:0 20px 40px rgba(0,0,0,0.5)">
        <div style="text-align:center;margin-bottom:28px">
          <span style="font-size:32px;font-weight:900;color:#ffffff;letter-spacing:-1px">my<span style="color:#f97316">tt</span></span>
          <p style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin:4px 0 0">Türkiye'nin İhale Platformu</p>
        </div>

        <h2 style="color:#ffffff;margin:0 0 10px;font-size:22px;font-weight:800;text-align:center">E-posta Doğrulama Kodu</h2>
        <p style="color:#94a3b8;margin:0 0 28px;font-size:14px;line-height:1.6;text-align:center">
          Merhaba <strong style="color:#ffffff">${opts.name}</strong>,<br>İşleminizi tamamlamak için 6 haneli güvenlik kodunuz:
        </p>

        <div style="text-align:center;margin:0 0 28px;padding:24px 16px;background:#090d16;border-radius:16px;border:1px solid #334155">
          ${digits}
        </div>

        <div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:14px;padding:16px 18px;margin-bottom:24px;text-align:center">
          <p style="margin:0;font-size:13px;color:#fb923c;line-height:1.5 font-weight:600">
            ⏰ <strong>Bu onay kodu 5 dakika geçerlidir.</strong><br>
            Güvenliğiniz için bu kodu kimseyle paylaşmayın.
          </p>
        </div>

        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0 20px" />

        <p style="color:#64748b;font-size:11px;margin:0;text-align:center;line-height:1.5">
          Bu e-posta <strong>MYTT Gmail SMTP Güvenlik Servisi</strong> tarafından otomatik gönderilmiştir.<br>
          <a href="${siteUrl}" style="color:#f97316;text-decoration:none;font-weight:700">mytt.com.tr</a>
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

export async function sendSellRequestCreated(opts: {
  buyerEmail: string; buyerName: string; requestId: string; deviceName: string; expiresAt: Date;
}): Promise<void> {
  const shortId = opts.requestId.slice(0, 8).toUpperCase();
  const expireStr = opts.expiresAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  await send(
    opts.buyerEmail,
    `Satış Talebiniz Alındı — ${opts.deviceName}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#EA580C,#F97316);border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px">
          <span style="color:#fff;font-size:24px">📱</span>
        </div>
        <h2 style="color:#18181b;margin:0 0 8px">Satış Talebiniz Alındı!</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.buyerName}</strong>, <strong>${opts.deviceName}</strong> için satış talebiniz sisteme eklendi.</p>
        <div style="background:#fff7ed;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;font-size:12px;color:#EA580C;text-transform:uppercase;letter-spacing:1px;font-weight:700">Talep Kodu</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:#EA580C;font-family:monospace">#${shortId}</p>
        </div>
        <div style="background:#fff7ed;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #fed7aa">
          <p style="margin:0;font-size:13px;color:#c2410c;font-weight:700">⏰ Teklif Süresi: ${expireStr}'a kadar</p>
          <p style="margin:4px 0 0;font-size:12px;color:#9a3412">Bayiler 1 saat boyunca size fiyat teklifi sunacak. Süre dolunca en iyi teklifi görüp kabul edebilirsiniz.</p>
        </div>
        <a href="${siteUrl}/hesabim?tab=sell-requests" style="display:block;background:#EA580C;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Teklifleri Takip Et
        </a>
      </div>
    </div>`,
  );
}

export async function sendDealerNewSellRequest(opts: {
  dealerEmail: string; dealerName: string; requestId: string; deviceName: string; grade: string;
}): Promise<void> {
  await send(
    opts.dealerEmail,
    `Yeni Satış Talebi — ${opts.deviceName} (${opts.grade})`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Yeni Alım Fırsatı!</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.dealerName}</strong>, bir müşteri cihazını satmak istiyor.</p>
        <div style="background:#f4f4f5;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:11px;color:#71717a;text-transform:uppercase;letter-spacing:1px">Cihaz</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#18181b">${opts.deviceName}</p>
          <p style="margin:4px 0 0;color:#71717a;font-size:13px">Kozmetik Durum: <strong>${opts.grade}</strong></p>
        </div>
        <div style="background:#fef3c7;border-radius:12px;padding:12px 16px;margin-bottom:24px">
          <p style="margin:0;font-size:12px;color:#92400e;font-weight:700">⏰ Teklifler 1 saat içinde kapanıyor!</p>
        </div>
        <a href="${siteUrl}/dealer/buy-requests/${opts.requestId}" style="display:block;background:#0c4a6e;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Teklif Ver — Bayi Paneli
        </a>
      </div>
    </div>`,
  );
}

export async function sendAuctionExpired(opts: {
  buyerEmail: string; buyerName: string; requestId: string; deviceName: string; bestOffer: number | null; bidCount: number;
}): Promise<void> {
  const shortId = opts.requestId.slice(0, 8).toUpperCase();
  const offerHtml = opts.bestOffer
    ? `<div style="background:#ecfdf5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
         <p style="margin:0 0 4px;font-size:12px;color:#065f46;text-transform:uppercase;letter-spacing:1px;font-weight:700">En Yüksek Teklif</p>
         <p style="margin:0;font-size:36px;font-weight:900;color:#065f46">${opts.bestOffer.toLocaleString('tr-TR')} ₺</p>
         <p style="margin:4px 0 0;font-size:12px;color:#059669">${opts.bidCount} bayi teklif verdi</p>
       </div>`
    : `<div style="background:#fef2f2;border-radius:12px;padding:16px;margin-bottom:24px">
         <p style="margin:0;color:#991b1b;font-size:13px;">Ne yazık ki bu cihaz için henüz teklif gelmedi.</p>
       </div>`;
  await send(
    opts.buyerEmail,
    `Teklifler Hazır — ${opts.deviceName} #${shortId}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Teklifler Kapandı!</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.buyerName}</strong>, <strong>${opts.deviceName}</strong> için teklif süresi sona erdi.</p>
        ${offerHtml}
        <a href="${siteUrl}/hesabim?tab=sell-requests&id=${opts.requestId}" style="display:block;background:#EA580C;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Teklifleri Gör ve Karar Ver
        </a>
      </div>
    </div>`,
  );
}

export async function sendSellRequestAccepted(opts: {
  buyerEmail: string; buyerName: string; requestId: string; deviceName: string; amount: number;
}): Promise<void> {
  const shortId = opts.requestId.slice(0, 8).toUpperCase();
  await send(
    opts.buyerEmail,
    `Teklif Kabul Edildi — Cihazınızı Kargolamanızı Bekliyoruz`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Teklif Kabul Edildi!</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.buyerName}</strong>, <strong>${opts.deviceName}</strong> için <strong style="color:#065f46">${opts.amount.toLocaleString('tr-TR')} ₺</strong> teklifini kabul ettiniz.</p>
        <div style="background:#eff6ff;border-radius:12px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.6">
            📦 Lütfen cihazınızı platform adresine kargo gönderin ve kargo takip kodunu hesabınızdan girin.
          </p>
        </div>
        <a href="${siteUrl}/hesabim?tab=sell-requests&id=${opts.requestId}" style="display:block;background:#EA580C;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Kargo Kodumu Gir
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;text-align:center">Talep No: #${shortId}</p>
      </div>
    </div>`,
  );
}

export async function sendBidWon(opts: {
  dealerEmail: string; dealerName: string; requestId: string; deviceName: string; amount: number;
}): Promise<void> {
  const shortId = opts.requestId.slice(0, 8).toUpperCase();
  await send(
    opts.dealerEmail,
    `Teklifiniz Kazandı — ${opts.deviceName}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Teklifiniz Kabul Edildi!</h2>
        <p style="color:#71717a;margin:0 0 24px">Merhaba <strong>${opts.dealerName}</strong>, müşteri <strong>${opts.deviceName}</strong> için teklifinizi kabul etti.</p>
        <div style="background:#ecfdf5;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
          <p style="margin:0 0 4px;font-size:12px;color:#065f46;text-transform:uppercase;letter-spacing:1px;font-weight:700">Kazanılan Tutar</p>
          <p style="margin:0;font-size:32px;font-weight:900;color:#065f46">${opts.amount.toLocaleString('tr-TR')} ₺</p>
        </div>
        <p style="color:#71717a;font-size:13px;margin:0 0 24px">Müşteri cihazını kargolayacak. Cihaz depoya ulaşıp denetimden geçtikten sonra ödemeniz yapılacaktır.</p>
        <a href="${siteUrl}/dealer/buy-requests/${opts.requestId}" style="display:block;background:#0c4a6e;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Bayi Panelimde Takip Et
        </a>
        <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;text-align:center">Talep No: #${shortId}</p>
      </div>
    </div>`,
  );
}

export async function sendDealerApproved(opts: { email: string; name: string; companyName: string }): Promise<void> {
  await send(
    opts.email,
    `Bayi Başvurunuz Onaylandı 🎉`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Başvurunuz Onaylandı! 🎉</h2>
        <p style="color:#71717a;margin:0 0 24px">
          Merhaba <strong>${opts.name}</strong>, <strong>${opts.companyName}</strong> olarak
          ${siteName} bayi ağına katıldınız.
        </p>
        <div style="background:#ecfdf5;border-radius:12px;padding:16px;margin-bottom:24px">
          <p style="margin:0;font-size:13px;color:#166534;line-height:1.6">
            ✅ Artık ürün listeleyebilir, sipariş alabilir ve bayi panelinizi kullanabilirsiniz.
          </p>
        </div>
        <a href="${siteUrl}/dealer/dashboard"
           style="display:block;background:#18181b;color:#fff;text-decoration:none;padding:14px;border-radius:12px;text-align:center;font-weight:700;font-size:14px">
          Bayi Panelime Git
        </a>
      </div>
    </div>`,
  );
}

export async function sendDealerRejected(opts: { email: string; name: string }): Promise<void> {
  await send(
    opts.email,
    `Bayi Başvurusu Hakkında`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="color:#18181b;margin:0 0 8px">Başvurunuz İncelendi</h2>
        <p style="color:#71717a;margin:0 0 24px">
          Merhaba <strong>${opts.name}</strong>, bayi başvurunuz incelenmiş ve şu an için onaylanamamıştır.
        </p>
        <p style="color:#71717a;font-size:14px;line-height:1.6">
          Eksik veya hatalı bilgi olduğunu düşünüyorsanız destek ekibimizle iletişime geçebilirsiniz.
        </p>
        <a href="mailto:destek@mytt.com.tr"
           style="display:inline-block;margin-top:16px;color:#6366f1;font-weight:600;font-size:14px;text-decoration:none">
          Destek ile İletişime Geç →
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
