'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';

// ─── Revenue Chart (Dealer) ───────────────────────────────────────────────────
interface RevenueData {
  month: string;
  ciro:  number;
  kar:   number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const fmtTL = (v: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,15,25,0.96), rgba(20,20,35,0.96))',
      border: '1px solid rgba(0,208,132,0.25)',
      borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(20px)',
    }}>
      <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', marginBottom: '6px', fontWeight: 700, letterSpacing: '0.05em' }}>
        {label}
      </p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: 700 }}>
          {entry.name === 'ciro' ? 'Ciro:' : 'Net Kâr:'} {fmtTL(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '24px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 700 }}>Aylık Ciro & Net Kâr</h3>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', marginTop: '2px' }}>Son 8 ay performansı</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradCiro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradKar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D084" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D084" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', paddingTop: '12px' }} />
          <Area type="monotone" dataKey="ciro" name="ciro" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gradCiro)" dot={false} activeDot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }} />
          <Area type="monotone" dataKey="kar"  name="kar"  stroke="#00D084" strokeWidth={2.5} fill="url(#gradKar)"  dot={false} activeDot={{ r: 5, fill: '#00D084', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Return Rate Chart (Dealer) ───────────────────────────────────────────────
interface ReturnData {
  month: string;
  iade:  number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReturnTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,15,25,0.96)', border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '12px', padding: '10px 14px',
    }}>
      <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#f87171', fontSize: '13px', fontWeight: 700 }}>İade: %{payload[0].value}</p>
    </div>
  );
};

export function ReturnRateChart({ data }: { data: ReturnData[] }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '24px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 700 }}>İptal / İade Oranı</h3>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', marginTop: '2px' }}>% (düşük = iyi)</p>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip content={<ReturnTooltip />} />
          <Bar dataKey="iade" name="İade %" fill="#ef4444" radius={[4,4,0,0]} fillOpacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Platform GMV Chart (Admin) ───────────────────────────────────────────────
interface PlatformData {
  month:      string;
  gmv:        number;
  commission: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdminTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,20,0.97)', border: '1px solid rgba(168,85,247,0.25)',
      borderRadius: '12px', padding: '12px 16px',
    }}>
      <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', marginBottom: '6px', fontWeight: 700 }}>{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} style={{ color: entry.color, fontSize: '13px', fontWeight: 700 }}>
          {entry.name === 'gmv' ? 'GMV:' : 'Komisyon:'} {fmtTL(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function PlatformGMVChart({ data }: { data: PlatformData[] }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '16px', padding: '24px',
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 700 }}>Platform GMV & Komisyon</h3>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', marginTop: '2px' }}>Aylık işlem hacmi</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="gradGMV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={v => `${(v/1000000).toFixed(1)}M`} tick={{ fill: 'rgba(248,250,252,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<AdminTooltip />} />
          <Legend wrapperStyle={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', paddingTop: '12px' }} />
          <Area type="monotone" dataKey="gmv"        name="gmv"        stroke="#a855f7" strokeWidth={2.5} fill="url(#gradGMV)"  dot={false} activeDot={{ r: 5, fill: '#a855f7', strokeWidth: 0 }} />
          <Area type="monotone" dataKey="commission" name="commission"  stroke="#f59e0b" strokeWidth={2}   fill="url(#gradComm)" dot={false} activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
