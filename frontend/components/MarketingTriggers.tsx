'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Zap, Lock, Truck, RefreshCcw, Star,
  BadgeCheck, Clock, Award, CheckCircle2, ArrowRight,
  TrendingUp, Headphones, Sparkles, Building2, PhoneCall
} from 'lucide-react';

const QUICK_MODELS = [
  { name: 'iPhone 15 Pro Sat', href: '/sell?model=iPhone+15+Pro', tag: 'Popüler' },
  { name: 'iPhone 14 Sat', href: '/sell?model=iPhone+14', tag: 'Anında Teklif' },
  { name: 'Galaxy S24 Ultra Sat', href: '/sell?model=Galaxy+S24+Ultra', tag: 'Yüksek Fiyat' },
  { name: 'iPhone 13 Sat', href: '/sell?model=iPhone+13', tag: 'Çok Satan' },
  { name: 'Galaxy S23 Sat', href: '/sell?model=Galaxy+S23', tag: 'Hızlı Değerleme' },
];

export default function MarketingTriggers() {
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => String(n).padStart(2, '0');

  return (
    <section className="w-full bg-white text-slate-900 py-10 relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl my-8">
      {/* Arka plan yumuşak mavi/zümrüt radyal ışıklar */}
      <div className="pointer-events-none absolute -left-32 -top-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10 space-y-10">

        {/* ── 2. "Neden Mytt?" 4'lü Güven & Pazarlama Kartları ─────────────── */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black tracking-wider uppercase">
              TÜRKİYE'NİN LİDER PAZARYERİ GÜVENCESİ
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
              Neden Binlerce Kullanıcı Cihazını <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mytt'de Satıyor?</span>
            </h2>
            <p className="text-sm text-slate-600 font-medium mt-2">
              Onaylı 150+ bayi kapalı teklifte yarışır, cihazınız en yüksek fiyata ücretsiz kuryeyle kapınızdan alınır.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Kart 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Zap size={22} strokeWidth={2.2} />
              </div>
              <h3 className="text-lg font-black text-slate-900">En Yüksek Fiyat Garantisi</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Tek bayiye bağlı kalmayın. 150+ onaylı yetkili bayi kapalı açık artırmada teklif yarıştırsın.
              </p>
            </div>

            {/* Kart 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Truck size={22} strokeWidth={2.2} />
              </div>
              <h3 className="text-lg font-black text-slate-900">Adresten Ücretsiz Kurye</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Kargo şubesine gitmenize gerek yok. Kuryemiz cihazınızı kapınızdan ücretsiz teslim alır.
              </p>
            </div>

            {/* Kart 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Lock size={22} strokeWidth={2.2} />
              </div>
              <h3 className="text-lg font-black text-slate-900">%100 Güvenli Ödeme (Escrow)</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Paranız Escrow havuz hesabında güvendedir. 32-nokta ekspertiz onayından sonra anında hesabınıza geçer.
              </p>
            </div>

            {/* Kart 4 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-amber-300 hover:shadow-lg transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <ShieldCheck size={22} strokeWidth={2.2} />
              </div>
              <h3 className="text-lg font-black text-slate-900">TSE 12 Ay Garanti</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Tüm alım ve satımlar TSE standartlarında sertifikalı uzman kadromuz ve 12 ay garanti ile korunur.
              </p>
            </div>

          </div>
        </div>

        {/* ── Hızlı Model Butonları Barı ─────────────── */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2">Popüler Satış Aramaları:</span>
          {QUICK_MODELS.map((m) => (
            <Link
              key={m.name}
              href={m.href}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
            >
              <span>{m.name}</span>
              <ArrowRight size={12} className="text-blue-600" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
