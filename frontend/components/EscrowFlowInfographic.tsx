'use client';
import { ShieldCheck, Zap, Truck, BadgeCheck, CheckCircle2 } from 'lucide-react';

// Sadece Turuncu ve Türevleri (Orange & Shades)
const STEPS = [
  {
    step: '01',
    title: 'Cihazını İlana Koy & Teklif Al',
    desc: 'Cihaz bilgilerini ve fotoğraflarını yükle. 150+ onaylı yetkili bayi kapalı teklifte yarışsın.',
    icon: Zap,
    color: 'from-orange-500 to-amber-600',
    badge: '1 Saatte Teklif',
  },
  {
    step: '02',
    title: 'Ücretsiz Kuryeye Teslim Et',
    desc: 'En yüksek teklifi seç. Kuryemiz cihazını kapından ücretsiz teslim alıp merkeze ulaştırsın.',
    icon: Truck,
    color: 'from-amber-600 to-orange-700',
    badge: 'Sıfır Kargo Ücreti',
  },
  {
    step: '03',
    title: 'Paranı Escrow Güvencesiyle Al',
    desc: '32-nokta ekspertiz onayından sonra paran anında banka hesabına eksiksiz aktarılsın.',
    icon: ShieldCheck,
    color: 'from-orange-600 to-amber-700',
    badge: '%100 Güvenli Ödeme',
  },
];

export default function EscrowFlowInfographic() {
  return (
    <div className="w-full rounded-3xl bg-white/95 backdrop-blur-xl border border-orange-200/80 p-8 md:p-10 my-8 shadow-xl shadow-orange-950/5 relative overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-extrabold tracking-wider uppercase">
          KAPALI AÇIK ARTIRMA & ESCROW GÜVENCESİ
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
          Sistem Nasıl Çalışır? <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">3 Adımda Sıfır Risk</span>
        </h3>
        <p className="text-sm text-slate-600 font-medium mt-2">
          Alıcı ve satıcının hakları TSE onaylı merkez ve Escrow havuz hesabı ile %100 koruma altındadır.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative p-6 rounded-2xl bg-gradient-to-b from-orange-50/40 via-white to-orange-50/20 border border-orange-200/80 shadow-sm hover:shadow-xl hover:border-orange-400 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                    <Icon size={24} strokeWidth={2.2} />
                  </div>
                  <span className="text-3xl font-black text-orange-200">{s.step}</span>
                </div>

                <div className="inline-block px-2.5 py-1 rounded-md bg-orange-100/70 text-orange-900 text-[10px] font-extrabold mb-3 border border-orange-200/60">
                  {s.badge}
                </div>

                <h4 className="text-lg font-black text-slate-900 leading-snug">
                  {s.title}
                </h4>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                  {s.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-orange-100 flex items-center gap-1.5 text-[11px] font-bold text-orange-600">
                <CheckCircle2 size={13} className="text-orange-600" />
                <span>Doğrulanmış Escrow Adımı</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
