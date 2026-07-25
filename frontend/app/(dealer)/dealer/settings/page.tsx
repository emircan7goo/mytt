'use client';

import { Store, User, ShieldCheck, CreditCard, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';

interface StoreData {
  id: string;
  name: string;
  bio: string | null;
  address: string | null;
  owner: { id: string; email: string; taxId: string | null };
}

export default function DealerSettingsPage() {
  const { user } = useApp();

  const [storeId,   setStoreId]   = useState<string | null>(null);
  const [name,      setName]      = useState('');
  const [bio,       setBio]       = useState('');
  const [address,   setAddress]   = useState('');
  const [taxId,     setTaxId]     = useState<string | null>(null);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);

  // ── Mağaza verisini yükle ─────────────────────────────────────────────────
  useEffect(() => {
    setFetchLoading(true);
    setFetchError(null);
    apiClient.get<StoreData | null>('/stores/my')
      .then(({ data }) => {
        if (data) {
          setStoreId(data.id);
          setName(data.name ?? '');
          setBio(data.bio ?? '');
          setAddress(data.address ?? '');
          setTaxId(data.owner?.taxId ?? null);
        }
      })
      .catch(() => setFetchError('Mağaza bilgileri yüklenemedi. Lütfen sayfayı yenileyin.'))
      .finally(() => setFetchLoading(false));
  }, []);

  // ── Kaydet ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!storeId) {
      toast.error('Mağaza bulunamadı. Önce bir mağaza oluşturmanız gerekiyor.');
      return;
    }
    if (!name.trim()) {
      toast.error('Mağaza adı boş bırakılamaz.');
      return;
    }
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch(`/stores/${storeId}`, {
        name: name.trim(),
        bio:  bio.trim() || null,
        address: address.trim() || null,
      });
      setSaved(true);
      toast.success('Mağaza bilgileri kaydedildi.');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Kaydetme başarısız.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Yükleniyor ────────────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="flex flex-col gap-8 pb-10 mt-2">
        <div>
          <h2 className="text-zinc-50 text-[26px] font-heading font-bold tracking-tight">Mağaza Ayarları</h2>
          <p className="text-zinc-400 text-[13px] mt-1">Platform ödemeleri ve dükkan vitrin ayarlarınız.</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-zinc-500" />
        </div>
      </div>
    );
  }

  // ── Hata ─────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex flex-col gap-8 pb-10 mt-2">
        <div>
          <h2 className="text-zinc-50 text-[26px] font-heading font-bold tracking-tight">Mağaza Ayarları</h2>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  // ── Mağaza henüz yok ───────────────────────────────────────────────────────
  if (!storeId) {
    return (
      <div className="flex flex-col gap-8 pb-10 mt-2">
        <div>
          <h2 className="text-zinc-50 text-[26px] font-heading font-bold tracking-tight">Mağaza Ayarları</h2>
          <p className="text-zinc-400 text-[13px] mt-1">Platform ödemeleri ve dükkan vitrin ayarlarınız.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-zinc-900/50 rounded-3xl border border-zinc-800">
          <Store size={40} className="text-zinc-600" />
          <p className="text-zinc-400 text-sm">Henüz bir mağazanız yok.</p>
          <p className="text-zinc-500 text-xs">Bayi başvurunuz onaylandığında mağazanız oluşturulacaktır.</p>
        </div>
      </div>
    );
  }

  // ── Ana form ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 pb-10 mt-2">
      <div>
        <h2 className="text-zinc-50 text-[26px] font-heading font-bold tracking-tight">Mağaza Ayarları</h2>
        <p className="text-zinc-400 text-[13px] mt-1">Platform ödemeleri ve dükkan vitrin ayarlarınız.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Settings Navigation */}
        <div className="flex flex-col gap-2">
          {[
            { id: 'profile',  label: 'Vitrin Profili', icon: Store,       active: true  },
            { id: 'account',  label: 'Yetkili Hesap',  icon: User,        active: false },
            { id: 'payouts',  label: 'Ödeme ve İban',  icon: CreditCard,  active: false },
            { id: 'security', label: 'Güvenlik',        icon: ShieldCheck, active: false },
          ].map(tab => (
            <button key={tab.id} className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-colors border ${ tab.active ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-lg shadow-sky-500/5' : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/50 hover:text-zinc-100 hover:border-zinc-800' }`}>
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-3xl p-6 shadow-xl shadow-black/20">
            <h3 className="text-zinc-50 font-bold mb-6 pb-4 border-b border-zinc-800">Vitrin Bilgileri</h3>

            <div className="flex flex-col gap-6">

              {/* Mağaza Adı */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Mağaza Adı
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mağaza adınızı girin"
                  className="w-full bg-black/40 border border-zinc-700/50 rounded-xl py-3.5 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all font-medium placeholder:text-zinc-600"
                />
              </div>

              {/* Hakkımızda */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Hakkımızda (Vitrin Metni)
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Mağazanızı tanıtın..."
                  className="w-full bg-black/40 border border-zinc-700/50 rounded-xl py-3.5 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all font-medium resize-none leading-relaxed placeholder:text-zinc-600"
                />
              </div>

              {/* Adres / Şehir */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                  Adres / Şehir
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="İstanbul, Kadıköy"
                  className="w-full bg-black/40 border border-zinc-700/50 rounded-xl py-3.5 px-4 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all font-medium placeholder:text-zinc-600"
                />
              </div>

              {/* Vergi Levhası (salt okunur) */}
              {taxId && (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Vergi Levhası (Sistem)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    disabled
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 px-4 text-sm text-zinc-500 opacity-50 cursor-not-allowed font-mono tracking-widest"
                  />
                </div>
              )}

              {/* E-posta (salt okunur) */}
              {user?.email && (
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                    Hesap E-posta
                  </label>
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 px-4 text-sm text-zinc-500 opacity-50 cursor-not-allowed"
                  />
                </div>
              )}

              {/* Kaydet butonu */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-4">
                {saved && (
                  <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold">
                    <CheckCircle2 size={15} /> Kaydedildi
                  </div>
                )}
                <div className={saved ? '' : 'ml-auto'}>
                  <button
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="flex items-center gap-2 bg-zinc-100 text-zinc-950 px-6 py-3 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-950 rounded-full animate-spin" /> Kaydediliyor...</>
                      : <><Save size={16} /> Ayarları Kaydet</>
                    }
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
