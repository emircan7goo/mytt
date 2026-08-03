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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center justify-center">
          <Store size={24} className="text-[#FF6000]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Bayi & Bakiye Yönetimi</h1>
          <p className="text-slate-400 font-medium text-sm">Bayilerin sistem bakiyelerini ve onay durumlarını yönetin.</p>
        </div>
      </div>

      <div className="bg-[#111625] rounded-3xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-[#161d2f] flex justify-between items-center">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Bayi veya firma ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-400 focus:border-[#FF6000] focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161d2f] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Firma / Bayi</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4 text-right">Mevcut Bakiye</th>
                <th className="px-6 py-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Sonuç bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((dealer: any) => (
                  <tr key={dealer.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{dealer.companyName ?? dealer.name ?? 'Resmi Bayi'}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{dealer.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {dealer.email}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6000]/10 text-[#FF6000] font-black rounded-lg border border-[#FF6000]/30 text-base">
                        {Number(dealer.walletBalance ?? 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => setSelectedDealer(dealer)}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#FF6000] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          <WalletCards size={14} className="text-[#FF6000]" /> Bakiye İşlemi
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#131927] border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-[#161d2f]">
              <div>
                <h3 className="text-lg font-black text-white">Bakiye Güncelleme</h3>
                <p className="text-slate-400 text-sm mt-0.5 font-medium">{selectedDealer.companyName ?? selectedDealer.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mevcut</p>
                <p className="text-lg font-black text-[#FF6000] leading-none">
                  {Number(selectedDealer.walletBalance ?? 0).toLocaleString('tr-TR')} ₺
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">İşlem Tipi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('add')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      mode === 'add' 
                        ? 'border-[#FF6000] bg-[#FF6000]/15 text-[#FF6000]' 
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${mode === 'add' ? 'bg-[#FF6000]/20' : 'bg-slate-800'}`}>
                      <Plus size={16} />
                    </div>
                    <span className="text-xs font-bold">Üzerine Ekle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('set')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      mode === 'set' 
                        ? 'border-sky-500 bg-sky-500/15 text-sky-400' 
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${mode === 'set' ? 'bg-sky-500/20' : 'bg-slate-800'}`}>
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-xs font-bold">Yeni Değer Belirle</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  Tutar <span className="text-[10px] text-slate-500 normal-case">(Negatif değer girilebilir)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={mode === 'add' ? 'Örn: 5000' : 'Örn: 15000'}
                    className="w-full pl-9 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white focus:border-[#FF6000] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="bg-amber-500/10 rounded-xl p-3 flex gap-3 border border-amber-500/20">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 font-medium leading-relaxed">
                  {mode === 'add' 
                    ? `Mevcut bakiyenin (${Number(selectedDealer.walletBalance ?? 0).toLocaleString('tr-TR')} ₺) üzerine girdiğiniz tutar eklenecektir.` 
                    : `Bayinin bakiyesi girdiğiniz bu yeni tutar ile değiştirilecektir.`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDealer(null)}
                  className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 font-bold rounded-xl hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={!amount || updateWallet.isPending}
                  className="flex-[2] px-4 py-3 bg-gradient-to-r from-[#FF6000] to-[#EA580C] text-white font-bold rounded-xl hover:from-[#EA580C] hover:to-[#C2410C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#FF6000]/25"
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
