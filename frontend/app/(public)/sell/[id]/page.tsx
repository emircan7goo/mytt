'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Smartphone, ShieldCheck, ArrowLeft, Trophy, Clock, 
  CheckCircle2, AlertCircle, Loader2, Sparkles, Truck, Check 
} from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { OrderTimeline } from '@/components/OrderTimeline';

export default function CustomerSellRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  async function loadRequest() {
    try {
      const { data } = await apiClient.get(`/sell-requests/my/${id}`);
      setRequest(data);
    } catch (err) {
      console.error('İhale detay hatası:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequest();
  }, [id]);

  async function handleAcceptBid(bidId: string, amount: number) {
    if (!confirm(`${Number(amount).toLocaleString('tr-TR')} ₺ teklifi kabul etmek istediğinize emin misiniz?`)) {
      return;
    }
    setIsAccepting(true);
    try {
      await apiClient.post(`/sell-requests/${id}/accept-bid/${bidId}`);
      toast.success('Teklif başarıyla kabul edildi! Kargo bilgileri tarafınıza iletildi.');
      await loadRequest();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Teklif kabul edilirken bir hata oluştu.');
    } finally {
      setIsAccepting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white">
        <Loader2 size={36} className="animate-spin text-[#FF6000] mb-4" />
        <p className="text-slate-400 font-medium text-sm">İhale canlı verileri yükleniyor...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-4">
          <Smartphone size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2">İhale Bulunamadı</h1>
        <p className="text-slate-400 text-sm mb-6 text-center">İhale mevcut değil veya erişim yetkiniz bulunmuyor.</p>
        <Link href="/hesabim" className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-xl text-sm">
          Hesabıma Dön
        </Link>
      </div>
    );
  }

  const bids = request.bids ?? [];
  const highestBid = bids[0];

  return (
    <div className="min-h-screen bg-[#090D16] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/hesabim"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft size={14} /> İhalelerime Dön
          </Link>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
            request.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            request.status === 'PENDING' ? 'bg-[#FF6000]/20 text-[#FF6000] border border-[#FF6000]/30' :
            'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {request.status === 'ACCEPTED' ? 'TEKLİF KABUL EDİLDİ' : request.status === 'PENDING' ? 'CANLI İHALEDE' : 'TAMAMLANTI'}
          </span>
        </div>

        {/* Device Summary Card */}
        <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden">
              {request.imagesUrl && request.imagesUrl[0] ? (
                <Image src={request.imagesUrl[0]} alt={request.model} fill className="object-cover" />
              ) : (
                <Smartphone size={36} className="text-[#FF6000]" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FF6000] uppercase tracking-widest">{request.brand}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-bold text-slate-400">{request.storage}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{request.brand} {request.model}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Renk: <strong className="text-slate-200">{request.color}</strong></span>
                <span>•</span>
                <span>Kozmetik: <strong className="text-slate-200">{request.cosmeticGrade}</strong></span>
                {request.batteryHealth && (
                  <>
                    <span>•</span>
                    <span>Pil: <strong className="text-emerald-400">%{request.batteryHealth}</strong></span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-right shrink-0">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mevcut En Yüksek Teklif</p>
            <p className="text-2xl sm:text-3xl font-black text-[#FF6000]">
              {highestBid ? `${Number(highestBid.amount).toLocaleString('tr-TR')} ₺` : 'Henüz Teklif Yok'}
            </p>
          </div>
        </div>

        {/* Order Timeline Component if accepted */}
        {request.status === 'ACCEPTED' && (
          <div className="bg-[#111625] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Truck className="text-emerald-400" size={20} /> Kargo & Teslimat Süreci
              </h2>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                Escrow Korumasında
              </span>
            </div>

            <OrderTimeline currentStatus="DEALER_SHIPPED" />
          </div>
        )}

        {/* Incoming Bids Section */}
        <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Trophy className="text-[#FF6000]" size={22} /> Yetkili Bayi Teklifleri ({bids.length})
              </h2>
              <p className="text-xs text-slate-400 mt-1">Türkiye'nin yetkili telefoncu bayilerinden cihazınıza verilen teklifler.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
              <ShieldCheck size={14} /> %100 BDDK Escrow Güvenceli
            </span>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Clock size={36} className="animate-spin text-[#FF6000] mx-auto opacity-70" />
              <p className="text-white font-bold text-base">Bayiler İhaleyi İnceliyor...</p>
              <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                İhaleniz 150+ onaylı yetkili bayinin ekranına düştü. Birkaç dakika içinde en yüksek teklifler gelmeye başlayacaktır. Sayfayı açık tutabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid: any, index: number) => {
                const isTopBid = index === 0;
                return (
                  <div
                    key={bid.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isTopBid
                        ? 'bg-[#FF6000]/10 border-[#FF6000]/40 shadow-lg shadow-[#FF6000]/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isTopBid ? 'bg-[#FF6000] text-white' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{bid.dealerTag ?? `Onaylı Bayi #${index + 1}`}</span>
                          {isTopBid && (
                            <span className="px-2 py-0.5 bg-[#FF6000]/20 text-[#FF6000] border border-[#FF6000]/30 rounded text-[10px] font-black uppercase">
                              En Yüksek Teklif
                            </span>
                          )}
                        </div>
                        {bid.note && <p className="text-slate-400 text-xs mt-0.5 italic">"{bid.note}"</p>}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Teklif Tutarı</p>
                        <p className="text-xl font-black text-[#FF6000]">
                          {Number(bid.amount).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>

                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id, bid.amount)}
                          disabled={isAccepting}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#FF6000] to-[#EA580C] text-white font-bold rounded-xl text-xs hover:from-[#EA580C] hover:to-[#C2410C] transition-all shadow-md shadow-[#FF6000]/20 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isAccepting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          Kabul Et & Kargola
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
