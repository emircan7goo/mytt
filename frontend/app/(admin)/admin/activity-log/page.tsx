'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await apiClient.get('/admin/activity-log').catch(() => ({ data: [] }));
      setLogs(data);
    } catch (err) {
      toast.error('Aktivite logları alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Sistem Aktivite Logu</h1>
        <p className="text-sm text-zinc-500 mt-1">Platformdaki her türlü kritik işlemi ve admin hareketlerini izleyin.</p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
              {['Tarih', 'Admin', 'Aksiyon', 'Entity'].map(h => (
                <th key={h} className="px-5 py-3.5 text-zinc-500 text-[11px] font-bold uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Yükleniyor...</td></tr>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/[0.04] last:border-0 transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-4 text-zinc-500 text-xs font-mono">
                    {new Date(log.createdAt).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-5 py-4 font-semibold text-zinc-200">{log.admin?.name || 'Bilinmiyor'}</td>
                  <td className="px-5 py-4">
                    <span className="bg-white/[0.07] text-zinc-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-tight">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {log.entityType} <span className="opacity-50">#{log.entityId?.slice(0, 8)}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-16 text-center text-zinc-400 border border-dashed border-white/[0.06] m-4 rounded-xl">
                  Log kaydı bulunamadı. Aktiviteler başladığında burada listelenecektir.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
