'use client';
import Link from 'next/link';
import { Smartphone, PackageCheck, Zap, RefreshCcw, CreditCard, Store, ShieldCheck, HelpCircle } from 'lucide-react';

const WORLD_ITEMS = [
  { label: 'Hatasız 2. El Al', href: '/?cat=IkinciEl', icon: Smartphone, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { label: 'Sıfır Telefon Al', href: '/?cat=S%C4%B1f%C4%B1r', icon: PackageCheck, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'Cihazını Sat', href: '/sell', icon: Zap, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { label: 'Eskiyi Getir Yeniyi Al', href: '/trade-in', icon: RefreshCcw, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: '12 Taksit Fırsatı', href: '/?promo=taksit', icon: CreditCard, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { label: 'Yetkili Bayiler', href: '/magazalar', icon: Store, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'TSE 12 Ay Garanti', href: '/garanti', icon: ShieldCheck, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { label: 'Sıkça Sorulanlar', href: '/sss', icon: HelpCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
];

export default function MyttWorldGrid() {
  return (
    <div className="w-full my-6 max-w-full overflow-hidden">
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        
        <div className="text-left space-y-1">
          <span className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-widest">HIZLI EKOSİSTEM</span>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Mytt Dünyasını Keşfedin
          </h3>
        </div>

        {/* EasyCep Birebir 4'lü Aksiyon Kutu Izgarası */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {WORLD_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-orange-50/60 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-orange-300 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 select-none"
              >
                <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center mb-2.5 transition-transform duration-300 group-hover:scale-110 ${item.color}`}>
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.2} />
                </div>
                <span className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-orange-600 transition-colors leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
