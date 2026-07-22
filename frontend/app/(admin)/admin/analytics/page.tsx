'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { PlatformGMVChart, RevenueChart } from '@/components/dashboard/Charts';
import { TrendingUp, ShoppingCart, Users, Store, Package } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/admin/metrics').then((r) => setMetrics(r.data)).catch(() => {});
  }, []);

  const m = metrics ?? {};

  const stats = [
    { label: 'Toplam Satış Hacmi',   value: fmt(m.gmv ?? 0),            icon: <TrendingUp size={18}/>,   color: '#a855f7' },
    { label: 'Komisyon Geliri',       value: fmt(m.commission ?? 0),      icon: <TrendingUp size={18}/>,   color: '#f59e0b' },
    { label: 'Toplam Sipariş',        value: (m.totalOrders ?? 0).toString(), icon: <ShoppingCart size={18}/>, color: '#0ea5e9' },
    { label: 'Ortalama Sipariş',      value: fmt(m.avgOrderValue ?? 0),   icon: <ShoppingCart size={18}/>, color: '#10b981' },
    { label: 'Kayıtlı Üye',          value: (m.totalUsers ?? 0).toLocaleString('tr-TR'),   icon: <Users size={18}/>,        color: '#ec4899' },
    { label: 'Aktif Bayi',           value: (m.totalDealers ?? 0).toString(),               icon: <Store size={18}/>,        color: '#0ea5e9' },
    { label: 'Stok Ürün',            value: (m.totalProducts ?? 0).toString(),              icon: <Package size={18}/>,      color: '#a855f7' },
    { label: 'Son 30 Gün Sipariş',   value: (m.recentOrders ?? 0).toString(),               icon: <ShoppingCart size={18}/>, color: '#f59e0b' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div>
        <h2 className="text-white text-2xl font-light tracking-tight">Analizler</h2>
        <p className="text-zinc-500 text-sm mt-1">Platform geneli satış ve kullanım istatistikleri</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-black/50 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl border border-white/10" style={{ color: s.color, background: `${s.color}18` }}>
                {s.icon}
              </div>
              <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">{s.label}</span>
            </div>
            <div className="text-white font-light text-[24px] tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-zinc-400 text-sm font-semibold mb-4">Satış Grafiği</h3>
        <PlatformGMVChart data={[]} />
        <p className="text-zinc-400 text-xs text-center mt-3">Yeterli sipariş verisi biriktiğinde grafik burada görünecek.</p>
      </div>
    </div>
  );
}
