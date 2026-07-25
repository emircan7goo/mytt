'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, Ban, Percent, ChevronDown, Store, Users, RefreshCw, AlertCircle } from 'lucide-react';
import apiClient from '@/lib/api';

// ── Tipler ───────────────────────────────────────────────────────────────────
type UserRole    = 'customer' | 'dealer';
type UserStatus  = 'active' | 'pending_kyc' | 'banned';
type FilterType  = 'all' | 'customer' | 'dealer';
type StatusFilter = 'all' | 'active' | 'pending_kyc' | 'banned';

interface AdminUser {
  id:             string;
  name:           string;
  email:          string;
  role:           UserRole;
  status:         UserStatus;
  commissionRate: number;
  companyName:    string | null;
  joinedAt:       string;
  totalOrders:    number;
  totalRevenue:   number;
}

// ── Sabitler ─────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; border: string }> = {
  active:      { label: 'Aktif',        color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  pending_kyc: { label: 'KYC Bekliyor', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  banned:      { label: 'Banlı',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
};

const fmt = (n?: number) =>
  n ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n) : '—';

// ── Bileşen ───────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,        setUsers]        = useState<AdminUser[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [typeFilter,   setTypeFilter]   = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [editComm,     setEditComm]     = useState<string | null>(null);
  const [commValue,    setCommValue]    = useState<number>(10);
  const [saving,       setSaving]       = useState(false);

  // ── Kullanıcıları Çek ─────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<AdminUser[]>('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  // ── Filtreleme ────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase())
                     || u.email.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === 'all' || u.role === typeFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // ── Aksiyonlar ────────────────────────────────────────────────────────────
  const handleBan = async (id: string) => {
    try {
      const res = await apiClient.patch<{ isActive: boolean }>(`/admin/users/${id}/ban`);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          return { ...u, status: res.data.isActive ? 'active' : 'banned' };
        }),
      );
    } catch {
      alert('İşlem başarısız. Lütfen tekrar deneyin.');
    }
  };

  const handleSaveComm = async (id: string) => {
    setSaving(true);
    try {
      // commValue kullanıcıdan % olarak alınır (örn: 5), DB'ye 0-1 aralığında gönderilir (0.05)
      const rateDecimal = commValue / 100;
      await apiClient.patch(`/admin/users/${id}/commission`, { commissionRate: rateDecimal });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, commissionRate: rateDecimal } : u)),
      );
      setEditComm(null);
    } catch {
      alert('Komisyon güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ color: '#f8fafc', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Kullanıcı Yönetimi
          </h2>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px' }}>
            Müşteri ve bayi hesaplarını yönetin, KYC onayı yapın.
          </p>
        </div>
        <button
          onClick={() => void fetchUsers()}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(248,250,252,0.7)', cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Yenile
        </button>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', fontSize: '13px',
        }}>
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Filtreler */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Arama */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,250,252,0.4)' }} />
          <input
            id="user-search"
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f8fafc', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Tür filtresi */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['all', 'customer', 'dealer'] as const).map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{
              padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
              background: typeFilter === f ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
              borderColor: typeFilter === f ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)',
              color: typeFilter === f ? '#a855f7' : 'rgba(248,250,252,0.5)',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              {f === 'customer' && <Users size={12} />}
              {f === 'dealer'   && <Store size={12} />}
              {f === 'all' ? 'Tümü' : f === 'customer' ? 'Müşteriler' : 'Bayiler'}
            </button>
          ))}
        </div>

        {/* Durum filtresi */}
        <div style={{ position: 'relative' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)} style={{
            appearance: 'none', padding: '8px 32px 8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(248,250,252,0.6)', cursor: 'pointer', outline: 'none',
          }}>
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="pending_kyc">KYC Bekliyor</option>
            <option value="banned">Banlı</option>
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,250,252,0.4)', pointerEvents: 'none' }} />
        </div>

        <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: '12px', marginLeft: 'auto' }}>
          {loading ? 'Yükleniyor...' : `${filtered.length} kayıt`}
        </span>
      </div>

      {/* Tablo */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(248,250,252,0.3)', fontSize: '14px' }}>
            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            Kullanıcılar yükleniyor...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Kullanıcı', 'Rol', 'Durum', 'Kayıt Tarihi', 'İşlem / Ciro', 'Komisyon', 'Aksiyon'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const cfg = STATUS_CONFIG[u.status];
                return (
                  <tr key={u.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>

                    {/* Kullanıcı */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>{u.name}</div>
                          <div style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px' }}>{u.email}</div>
                          {u.companyName && (
                            <div style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', marginTop: '2px' }}>{u.companyName}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                        background: u.role === 'dealer' ? 'rgba(14,165,233,0.12)' : 'rgba(16,185,129,0.1)',
                        color: u.role === 'dealer' ? '#0ea5e9' : '#8B5CF6',
                        border: `1px solid ${u.role === 'dealer' ? 'rgba(14,165,233,0.25)' : 'rgba(16,185,129,0.2)'}`,
                      }}>
                        {u.role === 'dealer' ? 'Bayi' : 'Müşteri'}
                      </span>
                    </td>

                    {/* Durum */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Kayıt Tarihi */}
                    <td style={{ padding: '14px 20px', color: 'rgba(248,250,252,0.5)', fontSize: '12px' }}>
                      {new Date(u.joinedAt).toLocaleDateString('tr-TR')}
                    </td>

                    {/* İşlem / Ciro */}
                    <td style={{ padding: '14px 20px', color: 'rgba(248,250,252,0.7)', fontSize: '13px', fontWeight: 600 }}>
                      {u.role === 'dealer' ? fmt(u.totalRevenue) : `${u.totalOrders} sipariş`}
                    </td>

                    {/* Komisyon */}
                    <td style={{ padding: '14px 20px' }}>
                      {u.role === 'dealer' ? (
                        editComm === u.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              value={commValue}
                              onChange={(e) => setCommValue(Number(e.target.value))}
                              min={0} max={30}
                              style={{
                                width: '56px', padding: '4px 8px', borderRadius: '6px',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                color: '#f8fafc', fontSize: '12px', outline: 'none',
                              }}
                            />
                            <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px' }}>%</span>
                            <button
                              onClick={() => void handleSaveComm(u.id)}
                              disabled={saving}
                              style={{ padding: '4px 10px', borderRadius: '6px', background: '#8B5CF6', border: 'none', color: 'white', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              {saving ? '...' : '✓'}
                            </button>
                            <button onClick={() => setEditComm(null)} style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(248,250,252,0.5)', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditComm(u.id); setCommValue(Math.round((u.commissionRate || 0.05) * 100)); }} style={{
                            display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '6px',
                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                            color: '#f59e0b', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          }}>
                            <Percent size={11} /> %{Math.round((u.commissionRate || 0.05) * 100)}
                          </button>
                        )
                      ) : <span style={{ color: 'rgba(248,250,252,0.25)', fontSize: '12px' }}>—</span>}
                    </td>

                    {/* Aksiyon */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {u.status !== 'banned' ? (
                          <button id={`ban-${u.id}`} onClick={() => void handleBan(u.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px',
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                          }}>
                            <Ban size={12} /> Banla
                          </button>
                        ) : (
                          <button id={`unban-${u.id}`} onClick={() => void handleBan(u.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '7px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                            color: '#8B5CF6', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                          }}>
                            <CheckCircle size={12} /> Aktif Et
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(248,250,252,0.3)', fontSize: '14px' }}>
            {error ? 'Veri yüklenemedi.' : 'Kayıt bulunamadı.'}
          </div>
        )}
      </div>

      {/* CSS animasyon */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
