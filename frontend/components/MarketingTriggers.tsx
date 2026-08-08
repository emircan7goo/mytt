'use client';
import { ShieldCheck, Zap, Truck, Award } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: '%100 Escrow Güvencesi',
    desc: 'Ödemeniz havuz hesabında bloke edilir. Cihazınızı teslim alana kadar paranız %100 korumadadır.',
    color: 'text-[#FF6000]',
    bg: 'bg-[#FF6000]/10 border-[#FF6000]/30',
  },
  {
    icon: Zap,
    title: '1 Saat Kapalı İhale',
    desc: '150+ onaylı yetkili bayi 1 saat içinde kapalı tekliflerde yarışır. En yüksek teklifi seçersiniz.',
    color: 'text-[#FF6000]',
    bg: 'bg-[#FF6000]/10 border-[#FF6000]/30',
  },
  {
    icon: Award,
    title: 'TSE 12 Ay Garanti',
    desc: 'Tüm sıfır ve ikinci el cihazlar 32-nokta ekspertizden geçer ve 12 ay garanti ile sunulur.',
    color: 'text-[#FF6000]',
    bg: 'bg-[#FF6000]/10 border-[#FF6000]/30',
  },
  {
    icon: Truck,
    title: 'Ücretsiz VIP Kurye',
    desc: 'Teklifi kabul ettiğiniz an kuryemiz kapınızdan teslim alır. Paranız aynı gün hesabınızda.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
  },
];

export default function MarketingTriggers() {
  return (
    <div className="w-full my-4 sm:my-8 max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-8">
      <div className="bg-[#0b0f19] border border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-10 text-white relative overflow-hidden">
        
        {/* Header — Mobilde Ultra Minimal */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-8 space-y-1.5 sm:space-y-3">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#FF6000]/15 text-[#FF6000] border border-[#FF6000]/30 text-[10px] sm:text-xs font-black tracking-widest uppercase">
            TÜRKİYE'NİN LİDER DOĞRULANMIŞ PAZARYERİ GÜVENCESİ
          </span>
          
          <h2 className="text-base sm:text-3xl font-black text-white tracking-tight">
            Neden Binlerce Kullanıcı Cihazını <span className="text-[#FF6000]">Mytt'de Satıyor?</span>
          </h2>
          
          <p className="hidden sm:block text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
            Geleneksel 2. el alım satım risklerini ortadan kaldıran şeffaf, hızlı ve yüksek fiyat garantili yeni nesil pazaryeri teknolojisi.
          </p>
        </div>

        {/* Features Grid — Mobilde 2x2 Kompakt Izgara */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div 
                key={i} 
                className="bg-white/5 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-white/10 shadow-md hover:border-[#FF6000]/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border shrink-0 ${f.bg} ${f.color}`}>
                    <Icon size={16} className="sm:hidden" strokeWidth={2.5} />
                    <Icon size={22} className="hidden sm:block" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-xs sm:text-base font-black text-white leading-tight">{f.title}</h3>
                </div>
                
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium leading-snug line-clamp-3 sm:line-clamp-none">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
