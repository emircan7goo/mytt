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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-xl border-t border-slate-200/90 py-1.5 px-2 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isCta) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center group -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 group-active:scale-95 transition-transform border-2 border-white">
                  <Icon size={22} className="fill-white" />
                </div>
                <span className="text-[10px] font-black text-orange-600 mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-colors ${
                isActive ? 'text-orange-600 font-extrabold' : 'text-slate-500 font-bold hover:text-slate-900'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
