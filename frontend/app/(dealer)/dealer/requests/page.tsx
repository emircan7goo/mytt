'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DealerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ modelName: '', grade: 'A', maxPrice: '', notes: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/catalog/requests/my').catch(() => ({ data: [] }));
      setRequests(data);
    } catch (err) {
      toast.error('Talepler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.modelName.trim()) return toast.error('Model adı gereklidir');

    const payload = { ...form, maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined };
    try {
      await apiClient.post('/catalog/requests', payload);
      toast.success('Stok talebiniz platforma iletildi');
      setIsFormOpen(false);
      setForm({ modelName: '', grade: 'A', maxPrice: '', notes: '' });
      fetchRequests();
    } catch (err) {
      toast.error('Hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stok Talebi Formu</h1>
          <p className="text-sm text-gray-500 mt-1">Katalogda bulunmayan veya platformda bulamadığınız modeli talep edin.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="btn-apple px-5 py-2.5 flex items-center gap-2 shadow-sm text-sm"
          >
            <Plus size={16} /> Yeni Talep
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="glass-card p-6 bg-white shadow-md">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Talep Formu</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-black">İptal</button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Aranan Model / Cihaz Adı</label>
              <input required value={form.modelName} onChange={e => setForm({...form, modelName: e.target.value})} className="apple-input w-full px-3 py-2 bg-gray-50 text-sm h-11" placeholder="Örn: Samsung Z Fold 4 512GB Siyah" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tercih Edilen Kozmetik (Grade)</label>
              <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} className="apple-input w-full px-3 py-2 bg-gray-50 text-sm h-11">
                <option value="A+">A+ veya daha iyi</option>
                <option value="A">A veya daha iyi</option>
                <option value="B">Fark etmez</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Maksimum Alış Fiyatı (TL - Opsiyonel)</label>
              <input type="number" min="1" value={form.maxPrice} onChange={e => setForm({...form, maxPrice: e.target.value})} className="apple-input w-full px-3 py-2 bg-gray-50 text-sm h-11" placeholder="Bütçenizi belirtebilirsiniz" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Açıklama / Özel Not</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="apple-input w-full px-3 py-2 bg-gray-50 text-sm h-24 resize-none" placeholder="Pil sağlığı %90 üstü olsun, kesinlikle kutulu olsun vb..."></textarea>
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" className="btn-apple w-full py-3.5 text-[15px] font-bold shadow-md">Talebi Gönder</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
               <tr>
                 <th className="p-4 font-semibold text-gray-600">Tarih</th>
                 <th className="p-4 font-semibold text-gray-600">Talep Edilen Model</th>
                 <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Kozmetik</th>
                 <th className="p-4 font-semibold text-gray-600 hidden md:table-cell">Bütçe</th>
                 <th className="p-4 font-semibold text-gray-600">Durum</th>
               </tr>
            </thead>
            <tbody>
               {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
               ) : requests.length > 0 ? (
                  requests.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 text-gray-500">{new Date(r.createdAt).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4">
                        <span className="font-bold text-gray-900">{r.modelName}</span>
                        {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                      </td>
                      <td className="p-4 hidden md:table-cell"><span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded text-xs">Grade {r.grade}</span></td>
                      <td className="p-4 hidden md:table-cell">{r.maxPrice ? <span className="font-medium text-gray-900">{Number(r.maxPrice).toLocaleString('tr-TR')} ₺</span> : '-'}</td>
                      <td className="p-4">
                        {r.status === 'PENDING' ? (
                          <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md w-fit font-bold text-xs"><Clock size={14} /> Bekleniyor</span>
                        ) : r.status === 'RESOLVED' ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md w-fit font-bold text-xs"><CheckCircle size={14} /> Bayi Bulundu</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-md w-fit font-bold text-xs"><XCircle size={14} /> İptal Edildi</span>
                        )}
                      </td>
                    </tr>
                  ))
               ) : (
                  <tr><td colSpan={5} className="p-16 text-center text-gray-500 border border-dashed m-4 rounded-xl">Hiç stok talebinde bulunmadınız.</td></tr>
               )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
