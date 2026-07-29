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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-[var(--k-surface)] backdrop-blur-xl border-t border-[var(--k-line)] py-1.5 px-2 shadow-2xl">
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] text-white flex items-center justify-center shadow-lg shadow-[var(--k-hot-glow)] group-active:scale-95 transition-transform border-2 border-[var(--k-line-2)]">
                  <Icon size={22} className="fill-white" />
                </div>
                <span className="text-[10px] font-black text-[var(--k-hot)] mt-0.5">
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
                isActive ? 'text-[var(--k-hot)] font-extrabold' : 'text-[var(--k-ink-3)] font-bold hover:text-[var(--k-ink)]'
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
