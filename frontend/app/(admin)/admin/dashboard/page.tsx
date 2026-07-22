'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import {
  DollarSign, TrendingUp, Users, Store, Ticket,
  ShoppingCart, Package, AlertCircle, RefreshCw,
  ArrowRight, CheckCircle, ClipboardList, Clock,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

function MetricCard({
  title, value, sub, icon, accent, href
}: {
  title: string; value: string; sub?: string;
  icon: React.ReactNode; accent: string; href?: string;
}) {
  const inner = (
    <div className="h-full flex flex-col gap-3 bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all hover:shadow-lg group cursor-pointer">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl border border-white/10" style={{ color: accent, background: `${accent}18` }}>
          {icon}
        </div>
        <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest leading-tight flex-1">
          {title}
        </span>
        {href && <ArrowRight size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
      </div>
      <div className="text-white font-light text-[28px] tracking-tight mt-auto">{value}</div>
      {sub && <p className="text-zinc-500 text-[11px] -mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Bekliyor',       color: '#f59e0b' },
  ESCROW:   { label: 'Ödeme Alındı',   color: '#0ea5e9' },
  RELEASED: { label: 'Teslim Edildi',  color: '#10b981' },
  REFUNDED: { label: 'İade',           color: '#ef4444' },
  CANCELLED:{ label: 'İptal',          color: '#6b7280' },
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get('/admin/metrics').catch(() => ({ data: null })),
      apiClient.get('/admin/dealers').catch(() => ({ data: [] })),
      apiClient.get('/admin/tickets').catch(() => ({ data: [] })),
      apiClient.get('/admin/orders').catch(() => ({ data: [] })),
      apiClient.get('/admin/pending-approvals').catch(() => ({ data: null })),
    ]).then(([m, d, t, o, pa]) => {
      setMetrics(m.data);
      setDealers(d.data);
      setTickets(t.data);
      setRecentOrders((Array.isArray(o.data) ? o.data : []).slice(0, 8));
      setPendingApprovals(pa.data);
    }).finally(() => setLoading(false));
  }, []);

  const m = metrics ?? {};
  const inactiveDealers  = dealers.filter((d: any) => d.isInactive);
  const openTickets      = tickets.filter((t: any) => t.status === 'OPEN');
  const totalPending     = pendingApprovals?.totalCount ?? 0;

  return (
    <div className="flex flex-col gap-8 pb-20 pt-2">

      {/* ── Onay Bekleyenler Banner ─────────────────────────────────── */}
      {totalPending > 0 && (
        <Link href="/admin/approvals" style={{ textDecoration: 'none' }}>
          <div className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={20} style={{ color: '#10b981' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#10b981', fontWeight: 800, fontSize: '15px', margin: 0 }}>
                {totalPending} kayıt onay bekliyor
              </p>
              <p style={{ color: 'rgba(16,185,129,0.6)', fontSize: '12px', margin: '2px 0 0' }}>
                {pendingApprovals?.sellRequests?.length ?? 0} satış talebi · {pendingApprovals?.dealerStocks?.length ?? 0} bayi stoku · {pendingApprovals?.dealerMarketItems?.length ?? 0} bayi ilanı — hemen incele →
              </p>
            </div>
            <div style={{ padding: '6px 16px', borderRadius: '10px', background: '#10b981', color: '#fff', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
              Onayla
            </div>
          </div>
        </Link>
      )}

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-[28px] font-light tracking-tight">
            Yönetim Paneli
          </h2>
          <p className="text-zinc-500 text-[12px] uppercase tracking-widest font-bold mt-1">
            Platform geneli canlı veriler
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-[13px] font-medium transition-colors"
        >
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {/* Birincil metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Toplam Satış Hacmi"
          value={loading ? '…' : fmt(m.gmv ?? 0)}
          sub="Platforma gelen toplam para"
          accent="#a855f7"
          icon={<DollarSign size={18}/>}
        />
        <MetricCard
          title="Komisyon Geliri"
          value={loading ? '…' : fmt(m.commission ?? 0)}
          sub="Platformun kazandığı pay (%5)"
          accent="#f59e0b"
          icon={<TrendingUp size={18}/>}
        />
        <MetricCard
          title="Ortalama Sipariş"
          value={loading ? '…' : fmt(m.avgOrderValue ?? 0)}
          sub="Her siparişin ortalama tutarı"
          accent="#0ea5e9"
          icon={<ShoppingCart size={18}/>}
        />
      </div>

      {/* İkincil metrikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Toplam Üye"
          value={loading ? '…' : (m.totalUsers ?? 0).toLocaleString('tr-TR')}
          accent="#10b981"
          icon={<Users size={15}/>}
        />
        <MetricCard
          title="Aktif Bayiler"
          value={loading ? '…' : (m.totalDealers ?? 0).toString()}
          accent="#0ea5e9"
          icon={<Store size={15}/>}
          href="/admin/dealers"
        />
        <MetricCard
          title="Toplam Sipariş"
          value={loading ? '…' : (m.totalOrders ?? 0).toLocaleString('tr-TR')}
          sub="Tüm zamanlar"
          accent="#a855f7"
          icon={<ClipboardList size={15}/>}
          href="/admin/orders"
        />
        <MetricCard
          title="Son 30 Gün"
          value={loading ? '…' : (m.recentOrders ?? 0).toString()}
          sub="Sipariş adedi"
          accent="#f97316"
          icon={<Clock size={15}/>}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <MetricCard
          title="Onay Bekleyen"
          value={loading ? '…' : (m.pendingKyc ?? 0).toString()}
          sub="Yeni bayi başvurusu"
          accent="#f59e0b"
          icon={<AlertCircle size={15}/>}
          href="/admin/dealer-approvals"
        />
        <MetricCard
          title="Açık Talepler"
          value={loading ? '…' : (m.openTickets ?? 0).toString()}
          sub="Yanıt bekleyen destek"
          accent="#ef4444"
          icon={<Ticket size={15}/>}
        />
        <MetricCard
          title="Toplam Ürün"
          value={loading ? '…' : (m.totalProducts ?? 0).toString()}
          sub="Stokta kayıtlı"
          accent="#a855f7"
          icon={<Package size={15}/>}
        />
      </div>

      <div className="w-full h-px bg-white/10 my-2" />

      {/* Son Siparişler */}
      {!loading && recentOrders.length > 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-zinc-100 font-bold text-[15px]">Son Siparişler</h3>
              <p className="text-zinc-500 text-[12px]">En güncel {recentOrders.length} sipariş</p>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-[12px] font-semibold transition-colors">
              Tümü <ArrowRight size={12}/>
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentOrders.map((o: any) => {
              const s = ORDER_STATUS[o.paymentStatus] ?? ORDER_STATUS.PENDING;
              const productName = o.dealerStock?.globalProduct
                ? `${o.dealerStock.globalProduct.brand ?? ''} ${o.dealerStock.globalProduct.model ?? ''}`.trim()
                : 'Ürün';
              return (
                <div key={o.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-[13px] font-semibold truncate">{productName}</p>
                    <p className="text-zinc-500 text-[11px] mt-0.5">
                      #{o.id.slice(0,8).toUpperCase()} · {o.buyer?.name ?? o.buyer?.email ?? '—'} · {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-zinc-100 font-bold text-[13px]">{fmt(Number(o.amount ?? 0))}</span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}33` }}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uyarı: Eylemsiz bayiler */}
      {inactiveDealers.length > 0 && (
        <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
            <div>
              <h3 className="text-amber-300 font-bold text-[14px]">
                {inactiveDealers.length} Bayi 10+ Gündür İlan Eklemiyor
              </h3>
              <p className="text-amber-500/70 text-[12px] mt-0.5">
                Bu bayilere hatırlatma yapmanız önerilir.
              </p>
            </div>
            <Link href="/admin/dealers" className="ml-auto flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-[13px] font-semibold transition-colors">
              Tümünü Gör <ArrowRight size={13}/>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {inactiveDealers.slice(0, 5).map((d: any) => (
              <div key={d.id}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[12px] font-medium text-amber-400">
                {d.storeName || d.name}
                <span className="text-amber-600 ml-1.5">({d.daysSinceLastStock}g önce)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Açık destek talepleri */}
      {openTickets.length > 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-zinc-100 font-bold text-[15px]">Açık Destek Talepleri</h3>
              <p className="text-zinc-500 text-[12px]">{openTickets.length} talep yanıt bekliyor</p>
            </div>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {openTickets.slice(0, 5).map((t: any) => (
              <div key={t.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-200 text-[13px] font-semibold truncate">{t.subject}</p>
                  <p className="text-zinc-500 text-[11px] mt-0.5 truncate">
                    {t.dealer?.name || t.dealer?.email} · {new Date(t.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-[10px] font-bold flex-shrink-0">
                  Bekliyor
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı erişim */}
      <div>
        <h3 className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold mb-4">Hızlı Erişim</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/dealer-approvals', label: 'Bayi Başvuruları',  icon: <CheckCircle size={16}/>, color: '#f59e0b' },
            { href: '/admin/dealers',          label: 'Bayi Analitik',      icon: <Store size={16}/>,       color: '#0ea5e9' },
            { href: '/admin/catalog',          label: 'Ürün Kataloğu',      icon: <Package size={16}/>,     color: '#a855f7' },
            { href: '/admin/builder',          label: 'Site Düzenleyici',   icon: <TrendingUp size={16}/>,  color: '#10b981' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.15] transition-all group"
            >
              <div className="p-2 rounded-lg" style={{ color: item.color, background: `${item.color}18` }}>
                {item.icon}
              </div>
              <span className="text-zinc-300 text-[13px] font-medium group-hover:text-white transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
