'use client';
import Link from 'next/link';
import { ShieldCheck, Laptop, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Cihazını İhaleye Çıkar',
    desc: 'Cihaz bilgilerini gir, 150+ onaylı yetkili bayi 1 saat içinde kapalı tekliflerde yarışsın.',
    icon: Laptop,
  },
  {
    step: '02',
    title: 'Adresten Ücretsiz Kurye',
    desc: 'En yüksek teklifi onayladığında VIP kuryemiz kapından ücretsiz teslim alsın.',
    icon: Truck,
  },
  {
    step: '03',
    title: 'Escrow Havuz Hesabı',
    desc: 'Ödemeniz BDDK lisanslı Escrow havuz hesabına aktarılır. Paranız %100 güvendedir.',
    icon: ShieldCheck,
  },
  {
    step: '04',
    title: 'Aynı Gün Anında Ödeme',
    desc: 'Ekspertiz onayından sonra paranız 15 dakika içinde banka hesabınıza yatırılır.',
    icon: CheckCircle2,
  },
];

export default function EscrowFlowInfographic() {
  return (
    <div className="w-full my-10">
      <div className="bg-[var(--k-canvas)] border border-[var(--k-line)] rounded-3xl p-8 md:p-12 text-white shadow-2xl space-y-8 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[var(--k-line)] pb-6">
          <div>
            <span className="text-xs font-black text-orange-400 tracking-widest uppercase">GÜVENLİ TİCARET AKIŞI</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
              4 Adımda <span className="text-orange-400">%100 Güvenli Alım Satım</span> Nasıl Çalışır?
            </h3>
          </div>
          <Link
            href="/garanti"
            className="text-xs font-black text-[var(--k-ink-4)] hover:text-orange-400 flex items-center gap-1.5 transition-colors"
          >
            <span>Escrow Detaylarını İncele</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-[var(--k-void)] rounded-2xl p-6 border border-[var(--k-line)] space-y-3 relative group hover:border-orange-500/60 transition-colors">
                <div className="flex items-center justify-between text-orange-400 font-mono font-black text-lg">
                  <span>{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Icon size={20} />
                  </div>
                </div>

                <div className="space-y-1 text-left pt-2">
                  <h4 className="text-base font-black text-white">{s.title}</h4>
                  <p className="text-xs text-[var(--k-ink-4)] font-medium leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
