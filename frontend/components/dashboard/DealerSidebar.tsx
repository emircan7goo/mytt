'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/providers/AppProvider';
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Settings, Zap, Store, LifeBuoy, Inbox, PlusCircle, ListChecks } from 'lucide-react';
import { useDealerSellRequests } from '@/lib/hooks/useSellRequests';
import { useMyDealerListings } from '@/lib/hooks/useDealerMarket';

const NAV_ITEMS = [
  { href: '/dealer/dashboard',    label: 'Genel Bakış',     icon: LayoutDashboard },
  { href: '/dealer/orders',       label: 'Siparişlerim',    icon: ShoppingBag     },
  { href: '/dealer/products',     label: 'Stok İlanlarım',  icon: Package         },
  { href: '/dealer/buy-requests', label: 'Pazaryeri',       icon: Inbox,          badgeKey: 'pazaryeri' },
  { href: '/dealer/sell',         label: 'Cihaz Sat',       icon: PlusCircle, highlight: true },
  { href: '/dealer/listings',     label: 'Paslaşma İlanlarım', icon: ListChecks,  badgeKey: 'listings' },
  { href: '/dealer/analytics',    label: 'Analizler',       icon: BarChart3       },
  { href: '/dealer/settings',     label: 'Ayarlar',         icon: Settings        },
  { href: '/dealer/support',      label: 'Destek',          icon: LifeBuoy        },
];

export default function DealerSidebar() {
  const pathname = usePathname();
  const { user } = useApp();
  const commissionRate = user?.commissionRate ? (user.commissionRate * 100).toFixed(0) : '8';

  // Live badge counts
  const { data: sellRequests } = useDealerSellRequests();
  const { data: myListings } = useMyDealerListings();
  const openPazaryeri = (sellRequests ?? []).filter((r: any) => r.status === 'PENDING').length;
  const activeListings = (myListings ?? []).filter((i: any) => i.status === 'ACTIVE' || i.status === 'PENDING_ADMIN').length;
  const activeBids = (myListings ?? []).filter((i: any) => i.status === 'ACTIVE' && (i._count?.bids ?? 0) > 0).length;
  const badges: Record<string, number> = {
    pazaryeri: openPazaryeri,
    listings: activeBids || activeListings,
  };
  return (
    <aside style={{
      width: '210px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: 'linear-gradient(180deg, #0b0e1a 0%, #0f1320 100%)',
      borderRight: '1px solid rgba(14,165,233,0.1)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
          }}>
            <Store size={15} color="white" />
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 800 }}>Mytt</div>
            <div style={{ color: '#0ea5e9', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Bayi Paneli</div>
          </div>
        </div>
      </div>

      {/* Mağaza durumu */}
      <div style={{ padding: '11px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 11px', borderRadius: '9px',
          background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.15)',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D084', boxShadow: '0 0 7px #00D084' }} />
          <span style={{ color: 'rgba(0,208,132,0.85)', fontSize: '11px', fontWeight: 700 }}>Mağaza Açık</span>
          <Zap size={10} color="rgba(0,208,132,0.5)" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 8px', flex: 1 }}>
        <p style={{ color: 'rgba(248,250,252,0.2)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 4px' }}>
          Menü
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight, badgeKey }: any) => {
          const isActive = pathname === href || (pathname.startsWith(href + '/') && href !== '/dealer/dashboard');
          const exactActive = pathname === href;
          const active = href === '/dealer/dashboard' ? exactActive : isActive;
          const accentColor = highlight ? '#10b981' : '#0ea5e9';
          const badgeCount = badgeKey ? (badges[badgeKey] ?? 0) : 0;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 11px', borderRadius: '9px', marginBottom: '2px',
              background: active ? `rgba(${highlight ? '16,185,129' : '14,165,233'},0.1)` : 'transparent',
              border: active ? `1px solid rgba(${highlight ? '16,185,129' : '14,165,233'},0.2)` : '1px solid transparent',
              color: active ? accentColor : highlight ? 'rgba(16,185,129,0.75)' : 'rgba(248,250,252,0.45)',
              textDecoration: 'none', fontSize: '13px', fontWeight: active ? 700 : (highlight ? 600 : 400),
              transition: 'all 0.15s',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={15} style={{ color: highlight ? '#10b981' : 'inherit' }} />
                {badgeCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -5, right: -6,
                    minWidth: 14, height: 14, borderRadius: '50%',
                    background: '#ef4444', color: '#fff',
                    fontSize: '8px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px',
                    boxShadow: '0 0 6px rgba(239,68,68,0.5)',
                  }}>{badgeCount > 9 ? '9+' : badgeCount}</span>
                )}
              </div>
              {label}
              {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: accentColor }} />}
            </Link>
          );
        })}
      </nav>

      {/* Komisyon */}
      <div style={{ padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.1)' }}>
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>Komisyon Oranım</p>
          <p style={{ color: '#0ea5e9', fontSize: '20px', fontWeight: 800 }}>%{commissionRate}</p>
          <p style={{ color: 'rgba(248,250,252,0.25)', fontSize: '11px' }}>Platform payı</p>
        </div>
      </div>
    </aside>
  );
}
