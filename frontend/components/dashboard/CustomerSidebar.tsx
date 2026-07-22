'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, ShieldCheck, Home, User, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/hesabim',           label: 'Hesabım',         icon: Home        },
  { href: '/hesabim/siparisler',label: 'Siparişlerim',    icon: Package     },
  { href: '/hesabim/garanti',   label: 'Garanti & Belgeler', icon: ShieldCheck },
  { href: '/hesabim/profil',    label: 'Profil',          icon: User        },
  { href: '/hesabim/ayarlar',   label: 'Ayarlar',         icon: Settings    },
];

export default function CustomerSidebar() {
  const pathname = usePathname();
  return (
    <aside style={{
      width: '220px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#fafbfc',
      borderRight: '1px solid rgba(15,23,42,0.07)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16,185,129,0.25)' }}>
            <ShieldCheck size={16} color="white" />
          </div>
          <div>
            <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: 800 }}>Mytt</div>
            <div style={{ color: '#10b981', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hesabım</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <p style={{ color: 'rgba(15,23,42,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>
          Menü
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
              background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
              border: isActive ? '1px solid rgba(16,185,129,0.18)' : '1px solid transparent',
              color: isActive ? '#059669' : 'rgba(15,23,42,0.45)',
              textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? 700 : 400,
              transition: 'all 0.15s',
            }}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Guarantee info */}
      <div style={{ padding: '14px 18px 24px', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldCheck size={13} color="#10b981" />
            <span style={{ color: '#059669', fontSize: '11px', fontWeight: 700 }}>6 Ay Garanti</span>
          </div>
          <p style={{ color: 'rgba(15,23,42,0.45)', fontSize: '11px', lineHeight: 1.5 }}>
            Tüm ürünler profesyonel test ve garanti kapsamında.
          </p>
        </div>
      </div>
    </aside>
  );
}
