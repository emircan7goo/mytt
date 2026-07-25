'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  WalletCards, Check, Plus, Minus, Search, 
  Store, Loader2, AlertCircle, TrendingUp
} from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

export default function AdminDealersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [amount, setAmount] = useState<string>('');
  const [mode, setMode] = useState<'add' | 'set'>('add');

  const { data: dealers, isLoading } = useQuery({
    queryKey: ['admin-dealers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dealers/wallet-list');
      return data;
    }
  });

  const updateWallet = useMutation({
    mutationFn: async ({ id, amt, m }: { id: string; amt: number; m: 'add' | 'set' }) => {
      const { data } = await apiClient.patch(`/admin/dealers/${id}/wallet`, {
        amount: amt,
        mode: m
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Bakiye başarıyla güncellendi!');
      qc.invalidateQueries({ queryKey: ['admin-dealers'] });
      setSelectedDealer(null);
      setAmount('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Bakiye güncellenemedi.');
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer || !amount) return;
    const num = Number(amount);
    if (isNaN(num)) return;
    
    updateWallet.mutate({ id: selectedDealer.id, amt: num, m: mode });
  };

  const filtered = (dealers ?? []).filter((d: any) => 
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center">
          <Store size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Bayi & Bakiye Yönetimi</h1>
          <p className="text-slate-500 font-medium">Bayilerin sistem bakiyelerini ve aktiflik durumlarını yönetin.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Bayi veya firma ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-zinc-900 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Firma / Bayi</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4 text-right">Mevcut Bakiye</th>
                <th className="px-6 py-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Sonuç bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((dealer: any) => (
                  <tr key={dealer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{dealer.companyName ?? 'Bilinmiyor'}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{dealer.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {dealer.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 font-black rounded-lg border border-violet-100/50 text-base">
                        {Number(dealer.walletBalance ?? 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => setSelectedDealer(dealer)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-zinc-900 text-zinc-900 rounded-xl text-xs font-bold shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                          <WalletCards size={14} /> Bakiye İşlemi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bakiye Modal */}
      {selectedDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900">Bakiye Güncelleme</h3>
                <p className="text-slate-500 text-sm mt-0.5 font-medium">{selectedDealer.companyName ?? selectedDealer.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mevcut</p>
                <p className="text-lg font-black text-violet-600 leading-none">
                  {Number(selectedDealer.walletBalance ?? 0).toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">İşlem Tipi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('add')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      mode === 'add' 
                        ? 'border-violet-500 bg-violet-50 text-violet-700' 
                        : 'border-slate-100 bg-white hover:border-slate-300 text-slate-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${mode === 'add' ? 'bg-violet-100' : 'bg-slate-100'}`}>
                      <Plus size={16} />
                    </div>
                    <span className="text-xs font-bold">Üzerine Ekle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('set')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      mode === 'set' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-100 bg-white hover:border-slate-300 text-slate-500'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${mode === 'set' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-xs font-bold">Yeni Değer Belirle</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  Tutar <span className="text-[10px] text-slate-400 normal-case">(Negatif değer girilebilir)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={mode === 'add' ? 'Örn: 5000' : 'Örn: 15000'}
                    className="w-full pl-9 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-zinc-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 flex gap-3 border border-amber-100">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  {mode === 'add' 
                    ? `Mevcut bakiyenin (${Number(selectedDealer.walletBalance ?? 0).toLocaleString('tr-TR')} ₺) üzerine girdiğiniz tutar eklenecektir.` 
                    : `Bayinin bakiyesi girdiğiniz bu yeni tutar ile değiştirilecektir.`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDealer(null)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!amount || updateWallet.isPending}
                  className="flex-[2] px-4 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updateWallet.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Onayla ve Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
