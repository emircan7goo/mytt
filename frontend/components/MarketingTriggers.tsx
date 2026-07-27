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
    <section className="w-full bg-slate-900 text-white py-10 relative overflow-hidden">
      {/* Arka plan parlama halkaları */}
      <div className="pointer-events-none absolute -left-32 -top-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10 space-y-10">

        {/* ── 2. "Neden Mytt?" 4'lü Güven & Pazarlama Kartları ─────────────── */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-extrabold tracking-wider uppercase">
              TÜRKİYE'NİN LİDER PAZARYERİ GÜVENCESİ
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-3">
              Neden Binlerce Kullanıcı Cihazını <span className="text-indigo-400">Mytt'de Satıyor?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <TrendingUp size={24} />
              </div>
              <h4 className="font-extrabold text-base text-white">En Yüksek Fiyat Garantisi</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
                Yüzlerce onaylı yetkili bayi cihazınız için kapalı teklifte yarışır. En yüksek teklifi siz seçersiniz.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Lock size={24} />
              </div>
              <h4 className="font-extrabold text-base text-white">%100 Escrow Ödeme Koruma</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
                Paranız güvenli Escrow havuz hesabında tutulur. Cihaz kontrol edilip onaylanana kadar ödemeniz tam güvendedir.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Truck size={24} />
              </div>
              <h4 className="font-extrabold text-base text-white">Kapıdan Ücretsiz VIP Kargo</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
                Kuryemiz cihazınızı kapınızdan ücretsiz teslim alır. Kargo veya ulaşım ücreti ödemezsiniz.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Award size={24} />
              </div>
              <h4 className="font-extrabold text-base text-white">12 Ay Tam Garanti</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2">
                Alacağınız tüm yenilenmiş cihazlar TSE onaylı 32-Nokta denetiminden geçer ve 12 ay birebir garantilidir.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Hızlı Model Fiyatlandırma Çipleri ────────────────────────── */}
        <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="text-left">
            <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">HIZLI TEKLİF AL</span>
            <h4 className="text-base font-bold text-white mt-0.5">Modelinizi Seçin, 30 Saniyede Fiyatını Öğrenin:</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {QUICK_MODELS.map((m) => (
              <Link
                key={m.name}
                href={m.href}
                className="px-4 py-2 rounded-xl bg-slate-700/80 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-xs border border-slate-600/80 transition-all flex items-center gap-2 group"
              >
                <span>{m.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[10px] font-extrabold group-hover:bg-white/20 group-hover:text-white">
                  {m.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── 4. Lisans, TSE & Sosyal Kanıt Altlığı ────────────────────────── */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <BadgeCheck size={18} className="text-emerald-400" />
              <span>TSE-HYB Sertifikalı Yenileme Merkezi</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-indigo-400" />
              <span>Ticaret Bakanlığı Lisanslı İzinli Tesis</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-400" />
              <span>ETBİS Kayıtlı Güvenli Pazaryeri</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
              <Star size={16} className="fill-amber-400" />
            </div>
            <span className="font-extrabold text-white">4.9 / 5.0</span>
            <span className="text-slate-500">(2.450+ Doğrulanmış Müşteri Yorumu)</span>
          </div>
        </div>

      </div>
    </section>
  );
}
