'use client';

import React from 'react';
import { 
  ShieldCheck, Truck, SearchCheck, CheckCircle2, DollarSign, Clock 
} from 'lucide-react';

export interface OrderTimelineProps {
  currentStatus: 'CREATED' | 'PENDING' | 'DEALER_SHIPPED' | 'WAREHOUSE_RECEIVED' | 'INSPECTION_PASSED' | 'DELIVERED' | 'COMPLETED' | 'RELEASED' | string;
  trackingNumber?: string;
  carrier?: string;
}

export function OrderTimeline({ currentStatus, trackingNumber, carrier = 'Yurtiçi Kargo' }: OrderTimelineProps) {
  const STEPS = [
    {
      id: 'CREATED',
      title: 'Ödeme Alındı & Escrow Kilitlendi',
      description: 'Tutar BDDK lisanslı güvenli havuz hesabında korumaya alındı.',
      icon: ShieldCheck,
      keyMatches: ['CREATED', 'PENDING', 'DEALER_SHIPPED', 'WAREHOUSE_RECEIVED', 'INSPECTION_PASSED', 'DELIVERED', 'COMPLETED', 'RELEASED'],
    },
    {
      id: 'DEALER_SHIPPED',
      title: 'Kargoya Verildi',
      description: trackingNumber ? `${carrier} — Takip No: ${trackingNumber}` : 'Cihaz kargo firmasına teslim edildi.',
      icon: Truck,
      keyMatches: ['DEALER_SHIPPED', 'WAREHOUSE_RECEIVED', 'INSPECTION_PASSED', 'DELIVERED', 'COMPLETED', 'RELEASED'],
    },
    {
      id: 'WAREHOUSE_RECEIVED',
      title: 'MYTT Test & İnceleme Merkezinde',
      description: 'Uzman ekibimiz cihazın %100 orijinal ve hatasız olduğunu doğruluyor.',
      icon: SearchCheck,
      keyMatches: ['WAREHOUSE_RECEIVED', 'INSPECTION_PASSED', 'DELIVERED', 'COMPLETED', 'RELEASED'],
    },
    {
      id: 'DELIVERED',
      title: 'Alıcıya Teslim Edildi',
      description: 'Cihaz alıcı tarafından teslim alındı.',
      icon: CheckCircle2,
      keyMatches: ['DELIVERED', 'COMPLETED', 'RELEASED'],
    },
    {
      id: 'COMPLETED',
      title: 'Ödeme Aktarıldı',
      description: 'Escrow kilidi açıldı, bakiye satıcı hesabına aktarıldı.',
      icon: DollarSign,
      keyMatches: ['COMPLETED', 'RELEASED'],
    },
  ];

  // Determine current active step index
  let activeIndex = 0;
  if (['COMPLETED', 'RELEASED'].includes(currentStatus)) activeIndex = 4;
  else if (currentStatus === 'DELIVERED') activeIndex = 3;
  else if (['WAREHOUSE_RECEIVED', 'INSPECTION_PASSED'].includes(currentStatus)) activeIndex = 2;
  else if (currentStatus === 'DEALER_SHIPPED') activeIndex = 1;

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0 hidden sm:block" />
        
        {/* Active Fill Line */}
        <div 
          className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-gradient-to-r from-[#FF6000] to-[#EA580C] rounded-full z-0 transition-all duration-500 hidden sm:block"
          style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {/* Steps Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-4">
          {STEPS.map((step, idx) => {
            const isDone = idx <= activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-3 text-left sm:text-center group">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all shadow-lg ${
                    isCurrent
                      ? 'bg-[#FF6000] border-white text-white shadow-[#FF6000]/40 scale-110'
                      : isDone
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="space-y-0.5">
                  <p className={`text-xs font-black transition-colors ${
                    isCurrent ? 'text-[#FF6000]' : isDone ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {trackingNumber && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF6000]/10 border border-[#FF6000]/30 rounded-xl text-[#FF6000]">
              <Truck size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{carrier} Kargo Takip</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{trackingNumber}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
            Canlı Takip Aktif
          </span>
        </div>
      )}
    </div>
  );
}
