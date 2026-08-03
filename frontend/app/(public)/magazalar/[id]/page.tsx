'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Store, Star, ShieldCheck, MapPin, CheckCircle2, Phone, 
  Smartphone, Award, Loader2, ArrowLeft, PackageCheck, Zap 
} from 'lucide-react';
import apiClient from '@/lib/api';

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'second_hand'>('all');

  useEffect(() => {
    async function loadStore() {
      try {
        const { data } = await apiClient.get(`/stores/${id}`);
        setStore(data);
      } catch (err) {
        console.error('Mağaza yüklenirken hata:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStore();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white">
        <Loader2 size={36} className="animate-spin text-[#FF6000] mb-4" />
        <p className="text-slate-400 font-medium text-sm">Mağaza bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mb-4">
          <Store size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2">Mağaza Bulunamadı</h1>
        <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
          Aradığınız mağaza mevcut değil veya sistemden kaldırılmış olabilir.
        </p>
        <Link
          href="/magazalar"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl font-bold text-sm transition-all"
        >
          <ArrowLeft size={16} /> Tüm Mağazalara Dön
        </Link>
      </div>
    );
  }

  const stocks = store.dealerStock ?? [];
  const filteredStocks = stocks.filter((item: any) => {
    if (activeTab === 'new') return item.condition === 'NEW';
    if (activeTab === 'second_hand') return item.condition === 'SECOND_HAND';
    return true;
  });

  const reviews = Array.isArray(store.reviews) ? store.reviews : [];

  return (
    <div className="min-h-screen bg-[#090D16] text-white pb-20">
      {/* Cover Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900 border-b border-white/10">
        <Image
          src={store.coverImage || 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&h=400&fit=crop&q=80'}
          alt={store.name}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/40 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/magazalar"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/15 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-black/80 transition-all"
          >
            <ArrowLeft size={14} /> Mağazalar
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 space-y-8">
        {/* Store Card Header */}
        <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#FF6000] shadow-xl shrink-0 bg-slate-800">
              <Image
                src={store.logo || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop&q=80'}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{store.name}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6000]/15 text-[#FF6000] border border-[#FF6000]/30 text-xs font-black rounded-lg">
                  <ShieldCheck size={14} /> MYTT Onaylı Yetkili Bayi
                </span>
              </div>

              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                {store.bio || 'Apple, Samsung ve Xiaomi yetkili garantili sıfır ve doğrulanmış ikinci el cihazlarda MYTT resmi bayisi.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 pt-1">
                {store.address && (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin size={14} className="text-[#FF6000]" /> {store.address}
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={14} className="fill-amber-400" /> {store.rating ?? 4.9} ({store.reviewCount ?? 0} Değerlendirme)
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <PackageCheck size={14} /> {store.jobsCompleted ?? 0}+ Başarılı İşlem
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href="/sell"
              className="w-full text-center px-6 py-3 bg-gradient-to-r from-[#FF6000] to-[#EA580C] text-white font-bold rounded-2xl text-xs shadow-lg shadow-[#FF6000]/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Zap size={14} /> Bu Bayiden Teklif Al
            </Link>
          </div>
        </div>

        {/* Stock Listings */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Smartphone className="text-[#FF6000]" size={22} /> Mağaza İlanları & Stokları
              </h2>
              <p className="text-xs text-slate-400 mt-1">Bu bayi tarafından satışa sunulan sıfır ve 2. el doğrulanmış cihazlar.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all' ? 'bg-[#FF6000] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tümü ({stocks.length})
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'new' ? 'bg-[#FF6000] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sıfır
              </button>
              <button
                onClick={() => setActiveTab('second_hand')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'second_hand' ? 'bg-[#FF6000] text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                2. El Hatasız
              </button>
            </div>
          </div>

          {filteredStocks.length === 0 ? (
            <div className="bg-[#111625] border border-white/10 rounded-3xl p-12 text-center text-slate-400">
              <Smartphone size={32} className="mx-auto mb-3 opacity-40 text-slate-500" />
              <p className="font-bold text-white mb-1">Bu kategoride aktif cihaz ilanı bulunmuyor.</p>
              <p className="text-xs text-slate-400">Diğer filtreleri seçerek mağazanın tüm stoklarını görüntüleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStocks.map((item: any) => {
                const gp = item.globalProduct ?? {};
                return (
                  <div 
                    key={item.id}
                    className="bg-[#111625] border border-white/10 rounded-3xl p-5 hover:border-[#FF6000]/50 transition-all group flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="relative h-48 w-full bg-slate-900/60 rounded-2xl overflow-hidden flex items-center justify-center p-4">
                        <Image
                          src={(gp.masterImages && gp.masterImages[0]) || (item.dealerImages && item.dealerImages[0]) || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80'}
                          alt={`${gp.brand} ${gp.model}`}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          item.condition === 'NEW' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        }`}>
                          {item.condition === 'NEW' ? 'SIFIR GARANTİLİ' : `2. EL (${item.grade || 'A+'})`}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-[#FF6000] transition-colors line-clamp-1">
                          {gp.brand} {gp.model}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {gp.storage} • {gp.color}
                        </p>
                      </div>

                      {item.condition === 'SECOND_HAND' && (
                        <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300 pt-1">
                          {item.batteryHealth && (
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700 font-bold">
                              Pil %{item.batteryHealth}
                            </span>
                          )}
                          {item.hasBox && (
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-emerald-400">
                              Kutulu
                            </span>
                          )}
                          {item.warrantyMonths && (
                            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-sky-400">
                              {item.warrantyMonths} Ay Garanti
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Peşin Fiyat</p>
                        <p className="text-lg font-black text-[#FF6000]">
                          {Number(item.price).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                      <Link
                        href={`/urun/${gp.brand?.toLowerCase()}/${gp.model?.toLowerCase()?.replace(/\s+/g, '-')}`}
                        className="px-4 py-2 bg-white/10 hover:bg-[#FF6000] text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        İncele
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Star className="text-amber-400 fill-amber-400" size={20} /> Müşteri Yorumları & Değerlendirmeleri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev: any, idx: number) => (
                <div key={idx} className="bg-[#111625] border border-white/10 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{rev.user}</span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: rev.rating ?? 5 }).map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
