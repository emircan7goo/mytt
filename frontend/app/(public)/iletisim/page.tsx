'use client';
import { useState } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function IletisimPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[1100px] mx-auto space-y-10">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-[var(--k-hot-wash)] text-[var(--k-hot)] font-extrabold text-xs tracking-wider uppercase border border-[var(--k-line-hot)]">
            7/24 MÜŞTERİ DESTEĞİ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--k-ink)] leading-tight">
            Bizimle <span className="text-[var(--k-hot)]">İletişime Geçin</span>
          </h1>
          <p className="text-[var(--k-ink-2)] text-base font-medium">
            Sorularınız, önerileriniz veya kurumsal iş birlikleri için müşteri hizmetleri ekibimiz her zaman yanınızda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* İletişim Bilgileri */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[var(--k-surface)] p-6 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--k-hot-wash)] text-[var(--k-hot)] flex items-center justify-center border border-[var(--k-line-hot)] shrink-0">
                  <PhoneCall size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--k-ink-4)] uppercase">Müşteri Hizmetleri</div>
                  <div className="text-lg font-black text-[var(--k-ink)]">0850 308 00 00</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--k-line)]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--k-hot-wash)] text-[var(--k-hot)] flex items-center justify-center border border-[var(--k-line-hot)] shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--k-ink-4)] uppercase">E-Posta Desteği</div>
                  <div className="text-sm font-black text-[var(--k-ink)]">destek@mytt.com.tr</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-[var(--k-line)]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--k-hot-wash)] text-[var(--k-hot)] flex items-center justify-center border border-[var(--k-line-hot)] shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--k-ink-4)] uppercase">Genel Merkez</div>
                  <div className="text-xs font-bold text-[var(--k-ink)]">Maslak Mah. Büyükdere Cad. No:245, Sarıyer / İstanbul</div>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-7 bg-[var(--k-surface)] p-8 rounded-3xl border border-[var(--k-line)] shadow-sm">
            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-[var(--k-ink)]">Mesajınız Alındı!</h3>
                <p className="text-[var(--k-ink-2)] text-sm font-medium">Müşteri temsilcimiz en kısa sürede sizinle iletişime geçecektir.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-[var(--k-ink)] mb-2">Bize Mesaj Gönderin</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--k-ink-2)] block mb-1">Adınız Soyadınız</label>
                    <input required type="text" placeholder="Orhan Yılmaz" className="w-full px-4 py-3 rounded-xl border border-[var(--k-line)] text-sm bg-[var(--k-canvas-2)] outline-none focus:border-[var(--k-hot-deep)]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--k-ink-2)] block mb-1">E-Posta Adresiniz</label>
                    <input required type="email" placeholder="orhan@example.com" className="w-full px-4 py-3 rounded-xl border border-[var(--k-line)] text-sm bg-[var(--k-canvas-2)] outline-none focus:border-[var(--k-hot-deep)]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--k-ink-2)] block mb-1">Konu</label>
                  <input required type="text" placeholder="İhale veya Cihaz Satışı Hakkında" className="w-full px-4 py-3 rounded-xl border border-[var(--k-line)] text-sm bg-[var(--k-canvas-2)] outline-none focus:border-[var(--k-hot-deep)]" />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--k-ink-2)] block mb-1">Mesajınız</label>
                  <textarea required rows={4} placeholder="Sorunuzu buraya yazabilirsiniz..." className="w-full px-4 py-3 rounded-xl border border-[var(--k-line)] text-sm bg-[var(--k-canvas-2)] outline-none focus:border-[var(--k-hot-deep)]" />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[var(--k-hot-deep)] hover:bg-[var(--k-hot-deep)] text-white font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  <span>Mesajı Gönder</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
