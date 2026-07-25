'use client';
import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store';
import {
  TrendingUp, ShoppingCart, Package, BarChart3,
  Wallet, Percent, Gavel, Trophy, Clock, Target,
  ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `%${(n * 100).toFixed(1)}`;

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color, trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-2 rounded-xl border border-white/10"
          style={{ color, background: `${color}18` }}
        >
          {icon}
        </div>
        <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest leading-tight">
          {label}
        </span>
        {trend && (
          <span className="ml-auto">
            {trend === 'up'      && <ArrowUpRight   size={14} className="text-violet-400" />}
            {trend === 'down'    && <ArrowDownRight  size={14} className="text-rose-400"    />}
            {trend === 'neutral' && <Minus           size={14} className="text-zinc-500"    />}
          </span>
        )}
      </div>
      <div className="text-zinc-100 font-light text-[22px]">{value}</div>
      {sub && <div className="text-zinc-400 text-[11px] mt-1">{sub}</div>}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-zinc-400">{icon}</span>
      <h3 className="text-zinc-300 font-semibold text-[15px]">{title}</h3>
    </div>
  );
}

export default function DealerAnalyticsPage() {
  const user = useAuthStore((s) => s.user);

  const [stocks,      setStocks]      = useState<any[]>([]);
  const [orders,      setOrders]      = useState<any[]>([]);
  const [sellBids,    setSellBids]    = useState<any[]>([]);  // /sell-requests/dealer
  const [marketItems, setMarketItems] = useState<any[]>([]);  // /dealer-market/my
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get('/catalog/stock/my').catch(() => ({ data: [] })),
      apiClient.get('/orders/dealer').catch(() => ({ data: [] })),
      apiClient.get('/sell-requests/dealer').catch(() => ({ data: [] })),
      apiClient.get('/dealer-market/my').catch(() => ({ data: [] })),
    ]).then(([s, o, sb, mi]) => {
      setStocks(Array.isArray(s.data)            ? s.data  : []);
      setOrders(Array.isArray(o.data)            ? o.data  : []);
      setSellBids(Array.isArray(sb.data)         ? sb.data : []);
      setMarketItems(Array.isArray(mi.data?.items ?? mi.data) ? (mi.data?.items ?? mi.data) : []);
    }).finally(() => setLoading(false));
  }, []);

  // ── Sipariş istatistikleri ──────────────────────────────────────────────────
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.amount ?? 0), 0);
  const commRate     = user?.commissionRate ?? 0.08;
  const commission   = totalRevenue * commRate;
  const netRevenue   = totalRevenue - commission;
  const activeStock  = stocks.filter((s) => s.stock > 0).length;
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'ESCROW').length;

  // ── Cihaz sat teklif istatistikleri ────────────────────────────────────────
  const totalBids = sellBids.length;
  const wonBids   = sellBids.filter((r) =>
    r.status === 'ACCEPTED' && r.winningDealerId === user?.id
  ).length;
  const winRate = totalBids > 0 ? wonBids / totalBids : 0;
  const activeBids = sellBids.filter((r) => r.status === 'PENDING').length;

  // ── Dealer market istatistikleri ────────────────────────────────────────────
  const activeListings = marketItems.filter((m) => m.status === 'ACTIVE').length;
  const soldListings   = marketItems.filter((m) => m.status === 'SOLD').length;
  const totalMarketRevenue = marketItems
    .filter((m) => m.status === 'SOLD')
    .reduce((sum, m) => sum + Number(m.finalPrice ?? 0), 0);

  // ── Aylık satış grafiği ─────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      if (key in months) months[key] += Number(o.amount ?? 0);
    });
    return Object.entries(months).map(([name, total]) => ({ name, total }));
  }, [orders]);

  // ── Stok grade dağılımı ─────────────────────────────────────────────────────
  const gradeData = useMemo(() => {
    const counts: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0 };
    stocks.forEach((s) => { if (s.grade in counts) counts[s.grade]++; });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, count]) => ({ name, count }));
  }, [stocks]);

  const gradeColors: Record<string, string> = {
    'A+': '#8B5CF6', A: '#0ea5e9', B: '#f59e0b', C: '#ef4444',
  };

  const walletBalance = Number((user as any)?.walletBalance ?? 0);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Başlık */}
      <div>
        <h2 className="text-zinc-50 text-2xl font-bold tracking-tight">Analizler</h2>
        <p className="text-zinc-500 text-sm mt-1">Satış, stok ve teklif performansınız</p>
      </div>

      {/* ── Finansal Özet ── */}
      <section>
        <SectionHeader icon={<TrendingUp size={16} />} title="Finansal Özet" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Net Kazanç"
            value={loading ? '…' : fmt(netRevenue)}
            sub={`Komisyon sonrası (${fmtPct(commRate)} kesildi)`}
            icon={<TrendingUp size={18} />}
            color="#8B5CF6"
          />
          <StatCard
            label="Brüt Satış"
            value={loading ? '…' : fmt(totalRevenue)}
            sub={`${orders.length} sipariş`}
            icon={<ShoppingCart size={18} />}
            color="#0ea5e9"
          />
          <StatCard
            label="Cüzdan Bakiyesi"
            value={loading ? '…' : fmt(walletBalance)}
            sub={walletBalance === 0 ? 'Teklif için bakiye yükle' : 'Teklif limiti aktif'}
            icon={<Wallet size={18} />}
            color={walletBalance > 0 ? '#8B5CF6' : '#f59e0b'}
          />
          <StatCard
            label="Komisyon Oranı"
            value={loading ? '…' : fmtPct(commRate)}
            sub="Platform payı (satış başına)"
            icon={<Percent size={18} />}
            color="#a855f7"
          />
        </div>
      </section>

      {/* ── Stok Özeti ── */}
      <section>
        <SectionHeader icon={<Package size={16} />} title="Stok Durumu" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Aktif İlan"
            value={loading ? '…' : activeStock.toString()}
            sub={`${stocks.length} toplam giriş`}
            icon={<Package size={18} />}
            color="#a855f7"
          />
          <StatCard
            label="Bekleyen Sipariş"
            value={loading ? '…' : pendingOrders.toString()}
            sub="Escrow'da bekleyen"
            icon={<Clock size={18} />}
            color="#f59e0b"
          />
          <StatCard
            label="Market İlanları"
            value={loading ? '…' : activeListings.toString()}
            sub={`${soldListings} satıldı`}
            icon={<Target size={18} />}
            color="#06b6d4"
          />
          <StatCard
            label="Market Geliri"
            value={loading ? '…' : fmt(totalMarketRevenue)}
            sub="Bayi marketinden"
            icon={<TrendingUp size={18} />}
            color="#84cc16"
          />
        </div>
      </section>

      {/* ── Cihaz Sat Teklif İstatistikleri ── */}
      <section>
        <SectionHeader icon={<Gavel size={16} />} title="Cihaz Sat — Teklif İstatistikleri" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Toplam Teklif"
            value={loading ? '…' : totalBids.toString()}
            sub="Müşteri taleplerinde"
            icon={<Gavel size={18} />}
            color="#8B5CF6"
          />
          <StatCard
            label="Kazanılan"
            value={loading ? '…' : wonBids.toString()}
            sub="Müşteri kabul etti"
            icon={<Trophy size={18} />}
            color="#8B5CF6"
            trend={wonBids > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            label="Kazanma Oranı"
            value={loading ? '…' : `%${(winRate * 100).toFixed(0)}`}
            sub={totalBids > 0 ? `${wonBids}/${totalBids} kazanıldı` : 'Henüz teklif yok'}
            icon={<Target size={18} />}
            color="#0ea5e9"
          />
          <StatCard
            label="Aktif Teklifler"
            value={loading ? '…' : activeBids.toString()}
            sub="Sonuç bekleniyor"
            icon={<Clock size={18} />}
            color="#8b5cf6"
          />
        </div>
      </section>

      {/* ── Grafikler ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Satış grafiği — 2/3 genişlik */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <SectionHeader icon={<BarChart3 size={16} />} title="Son 6 Ay Satış Grafiği" />
          {orders.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-zinc-400 text-sm">Siparişler geldikçe grafik otomatik dolacak.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: unknown) => [fmt(Number(v ?? 0)), 'Satış']}
                  contentStyle={{
                    background: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#salesGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Grade dağılımı — 1/3 genişlik */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <SectionHeader icon={<Package size={16} />} title="Stok Grade Dağılımı" />
          {gradeData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-zinc-400 text-sm text-center">Stok girişi yapıldıkça grafik dolacak.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={gradeData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: unknown) => [`${v} adet`, 'Stok']}
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {gradeData.map((entry) => (
                      <Cell key={entry.name} fill={gradeColors[entry.name] ?? '#71717a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-3">
                {gradeData.map((g) => (
                  <span
                    key={g.name}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${gradeColors[g.name] ?? '#71717a'}20`, color: gradeColors[g.name] ?? '#71717a' }}
                  >
                    {g.name}: {g.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
