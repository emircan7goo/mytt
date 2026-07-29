'use client';
import Link from 'next/link';
import { ShieldCheck, Zap, Truck, RotateCcw, Award, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '%100 Escrow Güvencesi',
    desc: 'Ödemeniz havuz hesabında bloke edilir. Cihazınızı teslim alıp onaylayana kadar paranız %100 korumadadır.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  {
    icon: Zap,
    title: '1 Saat Kapalı İhale',
    desc: 'Cihazınızı satışa çıkarın, 150+ onaylı yetkili bayi 1 saat içinde kapalı tekliflerde yarışsın. En yüksek teklifi siz seçin.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
  },
  {
    icon: Award,
    title: 'TSE 12 Ay Garantili Cihazlar',
    desc: 'Satın alacağınız sıfır veya ikinci el cihazlar 32-nokta ekspertiz aşamasından geçer ve 12 ay resmi garanti ile sunulur.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  {
    icon: Truck,
    title: 'Adresten Ücretsiz Kurye Alımı',
    desc: 'Teklifi kabul ettiğiniz an VIP kuryemiz kapınızdan ücretsiz teslim alır. Kargo ve yol stresi olmadan paranız aynı gün hesabınızda.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
];

export default function MarketingTriggers() {
  return (
    <div className="w-full my-8 max-w-[1440px] mx-auto px-4 lg:px-8">
      <div className="bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-black tracking-widest uppercase">
            TÜRKİYE'NİN LİDER DOĞRULANMIŞ PAZARYERİ GÜVENCESİ
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Neden Binlerce Kullanıcı Cihazını <span className="text-orange-400">Mytt'de Satıyor?</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Geleneksel 2. el alım satım risklerini ortadan kaldıran şeffaf, hızlı ve yüksek fiyat garantili yeni nesil pazaryeri teknolojisi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-md hover:border-orange-500/60 hover:-translate-y-1 transition-all duration-300 space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${f.bg} ${f.color}`}>
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-base font-black text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
