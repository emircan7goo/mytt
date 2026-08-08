'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, Zap, Heart, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Anasayfa', href: '/', icon: Home },
    { label: 'Kategoriler', href: '/#kategoriler', icon: Grid3X3 },
    { label: 'Cihaz Sat', href: '/sell', icon: Zap, isCta: true },
    { label: 'Favoriler', href: '/favoriler', icon: Heart },
    { label: 'Profil', href: '/login', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[#090D16]/95 backdrop-blur-2xl border-t border-white/10 py-1.5 px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCta) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center shrink-0 group px-1"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF6000] via-[#FF6000] to-[#EA580C] text-white flex items-center justify-center shadow-md shadow-[#FF6000]/40 group-active:scale-95 transition-transform border border-orange-300/30">
                  <Icon size={18} className="fill-white" />
                </div>
                <span className="text-[9px] font-black text-[#FF6000] mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all shrink-0 ${
                isActive ? 'text-[#FF6000] font-black scale-105' : 'text-slate-400 font-bold hover:text-white'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] leading-none tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
