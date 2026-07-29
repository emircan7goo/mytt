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
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[1100px] mx-auto space-y-10">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs tracking-wider uppercase border border-orange-200">
            7/24 MÜŞTERİ DESTEĞİ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Bizimle <span className="text-orange-600">İletişime Geçin</span>
          </h1>
          <p className="text-slate-600 text-base font-medium">
            Sorularınız, önerileriniz veya kurumsal iş birlikleri için müşteri hizmetleri ekibimiz her zaman yanınızda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* İletişim Bilgileri */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                  <PhoneCall size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Müşteri Hizmetleri</div>
                  <div className="text-lg font-black text-slate-900">0850 308 00 00</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">E-Posta Desteği</div>
                  <div className="text-sm font-black text-slate-900">destek@mytt.com.tr</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200 shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Genel Merkez</div>
                  <div className="text-xs font-bold text-slate-900">Maslak Mah. Büyükdere Cad. No:245, Sarıyer / İstanbul</div>
                </div>
              </div>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Mesajınız Alındı!</h3>
                <p className="text-slate-600 text-sm font-medium">Müşteri temsilcimiz en kısa sürede sizinle iletişime geçecektir.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 mb-2">Bize Mesaj Gönderin</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Adınız Soyadınız</label>
                    <input required type="text" placeholder="Orhan Yılmaz" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">E-Posta Adresiniz</label>
                    <input required type="email" placeholder="orhan@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-orange-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Konu</label>
                  <input required type="text" placeholder="İhale veya Cihaz Satışı Hakkında" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-orange-500" />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mesajınız</label>
                  <textarea required rows={4} placeholder="Sorunuzu buraya yazabilirsiniz..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-orange-500" />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2"
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
