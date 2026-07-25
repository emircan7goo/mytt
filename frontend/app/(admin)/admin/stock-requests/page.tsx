'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminStockRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await apiClient.get('/admin/stock-requests').catch(() => ({ data: [] }));
      setRequests(data);
    } catch (err) {
      toast.error('Stok talepleri alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/stock-requests/${id}`, { status });
      toast.success('Talep durumu güncellendi');
      fetchRequests();
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Bayi Stok Talepleri</h1>
        <p className="text-sm text-zinc-500 mt-1">Bayilerin &quot;Bu modeli arıyorum&quot; şeklindeki stok taleplerini yönetin.</p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
              {['Tarih', 'Bayi (Kullanıcı)', 'İstenen Model & Not', 'Durum', 'İşlem'].map(h => (
                <th key={h} className="px-5 py-3.5 text-zinc-500 text-[11px] font-bold uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Yükleniyor...</td></tr>
            ) : requests.length > 0 ? (
              requests.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/[0.04] last:border-0 transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-4 text-zinc-500 text-xs">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="px-5 py-4 font-bold text-zinc-200">{r.user?.name || 'Bilinmiyor'}</td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-zinc-100">{r.modelName}</div>
                    {r.grade && (
                      <span className="inline-block bg-white/[0.07] text-zinc-400 px-2 py-0.5 rounded text-xs mt-1">Grade {r.grade}</span>
                    )}
                    {r.notes && <p className="text-xs text-zinc-500 mt-1 italic">&quot;{r.notes}&quot;</p>}
                  </td>
                  <td className="px-5 py-4">
                    {r.status === 'PENDING' ? (
                      <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit font-bold text-xs">
                        <Clock size={12} /> Bekleyen
                      </span>
                    ) : r.status === 'RESOLVED' ? (
                      <span className="flex items-center gap-1.5 text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg w-fit font-bold text-xs">
                        <CheckCircle size={12} /> Çözüldü
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg w-fit font-bold text-xs">
                        <XCircle size={12} /> İptal
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {r.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(r.id, 'RESOLVED')}
                          className="px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 rounded-lg font-bold text-xs transition-colors"
                        >
                          Çözüldü Yap
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'REJECTED')}
                          className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg font-bold text-xs transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-16 text-center text-zinc-400 border border-dashed border-white/[0.06] m-4 rounded-xl">
                  Henüz bir model talebi yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
