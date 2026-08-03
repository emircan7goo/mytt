'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import {
  LayoutDashboard, Users, AlertTriangle, Settings,
  Zap, TrendingUp, Shield, Store, LayoutTemplate, Package,
  Image, ListOrdered, History, Scale, Boxes, Smartphone, ShoppingCart,
  BadgeCheck, Handshake, Banknote,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard',        label: 'Genel Bakış',        icon: LayoutDashboard },
  { href: '/admin/approvals',        label: 'Onay Merkezi',       icon: BadgeCheck,  highlight: true, badgeKey: 'approvals' },
  { href: '/admin/dealers',          label: 'Bayiler',            icon: Store           },
  { href: '/admin/dealer-approvals', label: 'Bayi Başvuruları',   icon: AlertTriangle   },
  { href: '/admin/catalog',          label: 'Ürün Kataloğu',      icon: Package         },
  { href: '/admin/stocks',           label: 'Bayi Stokları',      icon: Boxes           },
  { href: '/admin/stock-requests',   label: 'Stok Talepleri',     icon: ListOrdered     },
  { href: '/admin/sell-requests',    label: 'Satış Talepleri',    icon: Smartphone,     badgeKey: 'sellRequests' },
  { href: '/admin/dealer-market',    label: 'Bayi Paslaşma',      icon: Handshake,      badgeKey: 'dealerMarket' },
  { href: '/admin/orders',           label: 'Siparişler',         icon: ShoppingCart    },
  { href: '/admin/payouts',          label: 'Hakediş Talepleri',  icon: Banknote,       badgeKey: 'payouts' },
  { href: '/admin/disputes',         label: 'Anlaşmazlıklar',     icon: Scale           },
  { href: '/admin/users',            label: 'Kullanıcılar',       icon: Users           },
  { href: '/admin/analytics',        label: 'Analizler',          icon: TrendingUp      },
  { href: '/admin/activity-log',     label: 'Aktivite Logu',      icon: History         },
  { href: '/admin/settings',         label: 'Ayarlar',            icon: Settings        },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  // Live badge counts from pending approvals
  const { data: pendingData } = useQuery({
    queryKey: ['admin', 'pending-approvals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/pending-approvals');
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const badges: Record<string, number> = {
    approvals: pendingData?.totalCount ?? 0,
    sellRequests: (pendingData?.sellRequests ?? []).length,
    dealerMarket: (pendingData?.dealerMarketItems ?? []).length,
    payouts: (pendingData?.payoutRequests ?? []).length,
  };

  return (
    <aside style={{
      width: '220px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: 'linear-gradient(180deg, #0a0d1a 0%, #0d1117 100%)',
      borderRight: '1px solid rgba(168,85,247,0.12)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #a855f7, #EA580C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(168,85,247,0.4)',
          }}>
            <Shield size={15} color="white" />
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 800, lineHeight: 1.1 }}>Mytt</div>
            <div style={{ color: '#a855f7', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Paneli</div>
          </div>
        </div>
      </div>

      {/* Durum */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px', borderRadius: '9px',
          background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.18)',
        }}>
          <Zap size={12} color="#a855f7" />
          <span style={{ color: '#a855f7', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Tam Yetkili
          </span>
          <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 6px #a855f7' }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '0 10px', flex: 1 }}>
        <p style={{ color: 'rgba(248,250,252,0.2)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 8px 5px' }}>
          Menü
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight, badgeKey }: any) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          const accentColor = highlight ? '#F97316' : '#a855f7';
          const badgeCount = badgeKey ? (badges[badgeKey] ?? 0) : 0;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '9px', marginBottom: '2px',
              background: isActive ? `rgba(${highlight ? '249,115,22' : '168,85,247'},0.1)` : 'transparent',
              border: isActive ? `1px solid rgba(${highlight ? '249,115,22' : '168,85,247'},0.22)` : '1px solid transparent',
              color: isActive ? accentColor : highlight ? 'rgba(249,115,22,0.7)' : 'rgba(248,250,252,0.45)',
              textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? 700 : (highlight ? 600 : 400),
              transition: 'all 0.15s',
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={15} style={{ color: highlight ? '#F97316' : 'inherit' }} />
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
              {isActive && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: accentColor }} />}
            </Link>
          );
        })}
      </nav>

      {/* Platform durumu */}
      <div style={{ padding: '14px 18px 22px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(10,13,26,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '5px' }}>
            Platform
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#F97316', boxShadow: '0 0 6px #F97316' }} />
            <span style={{ color: '#F97316', fontSize: '11px', fontWeight: 600 }}>Sistemler Aktif</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
