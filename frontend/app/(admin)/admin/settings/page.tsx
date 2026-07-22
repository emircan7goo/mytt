'use client';
import { useState, useEffect } from 'react';
import {
  Shield, Bell, Percent, Save, Loader2,
  LayoutGrid, ChevronDown, ChevronUp, Eye, EyeOff,
  Smartphone, Brain, RefreshCcw, Check, AlertCircle,
} from 'lucide-react';
import { useSiteConfig, useUpdateSiteConfig, type FeatureCardConfig } from '@/lib/hooks/useSiteConfig';

// ── Kart meta (sabit, admin değiştiremez) ────────────────────────────────────
const CARD_META: Record<string, {
  label: string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
}> = {
  sell: {
    label: 'Cihazını Sat',
    icon: <Smartphone size={18} />,
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    accent: 'emerald',
  },
  'ai-finder': {
    label: 'AI Telefon Bulucu',
    icon: <Brain size={18} />,
    gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    accent: 'teal',
  },
  'trade-in': {
    label: 'Trade-In Hesaplayıcı',
    icon: <RefreshCcw size={18} />,
    gradient: 'linear-gradient(135deg, #16a34a, #15803d)',
    accent: 'green',
  },
};

const DEFAULT_CARDS: FeatureCardConfig[] = [
  {
    id: 'sell', enabled: true,
    title: 'Cihazını Sat',
    description: 'Yüzlerce yetkili bayi cihazın için kapalı teklifte yarışır. En yüksek teklifi onayla, kargola, paranı al.',
    badgeText: '1 Saatte Teklif', tag: 'Ücretsiz',
    features: ['Bayiler birbirinin teklifini göremez', 'Cihaz kargosuz teslim edilir', 'Ödeme garanti ile yapılır'],
    stat: '150+', statLabel: 'Aktif Bayi', ctaText: 'Başla',
  },
  {
    id: 'ai-finder', enabled: true,
    title: 'AI Telefon Bulucu',
    description: 'Bütçenizi ve kullanım alışkanlıklarınızı analiz edip size özel en iyi 3 cihazı anında listeleyelim.',
    badgeText: 'YZ Destekli', tag: 'Saniyeler içinde',
    features: ['Bütçe & ihtiyaç analizi yapılır', 'Kişiye özel 3 cihaz önerilir', 'Anlık fiyat karşılaştırması'],
    stat: '3', statLabel: 'Kişisel Öneri', ctaText: 'Hemen Bul',
  },
  {
    id: 'trade-in', enabled: true,
    title: 'Trade-In Hesaplayıcı',
    description: 'Eski telefonunuzun güncel piyasa değerini öğrenin, yeni cihazınızı çok daha uygun fiyata alın.',
    badgeText: 'Anlık Fiyat', tag: 'Ücretsiz',
    features: ['Güncel piyasa fiyatı gösterilir', 'Yeni cihazda doğrudan indirim', 'Güvenli & hızlı takas işlemi'],
    stat: '%40', statLabel: 'a kadar tasarruf', ctaText: 'Değerini Öğren',
  },
];

// ── Tek kart editörü ─────────────────────────────────────────────────────────
function CardEditor({
  card, onChange,
}: { card: FeatureCardConfig; onChange: (updated: FeatureCardConfig) => void }) {
  const [open, setOpen] = useState(false);
  const meta = CARD_META[card.id];

  const set = <K extends keyof FeatureCardConfig>(key: K, value: FeatureCardConfig[K]) =>
    onChange({ ...card, [key]: value });

  const setFeature = (i: number, val: string) => {
    const f = [...card.features] as [string, string, string];
    f[i] = val;
    onChange({ ...card, features: f });
  };

  return (
    <div className={`rounded-2xl border transition-all ${card.enabled ? 'border-zinc-700' : 'border-zinc-800 opacity-60'}`}
         style={{ background: 'rgba(24,24,27,0.7)' }}>

      {/* Başlık satırı */}
      <div className="flex items-center justify-between p-4 cursor-pointer select-none"
           onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          {/* Mini gradient önizleme */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
               style={{ background: meta.gradient }}>
            {meta.icon}
          </div>
          <div>
            <p className="text-zinc-100 font-bold text-sm">{card.title}</p>
            <p className="text-zinc-500 text-[11px]">{meta.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Enabled toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); set('enabled', !card.enabled); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${ card.enabled ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500' }`}
          >
            {card.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
            {card.enabled ? 'Görünür' : 'Gizli'}
          </button>
          {open ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
        </div>
      </div>

      {/* İçerik alanı */}
      {open && (
        <div className="px-4 pb-5 border-t border-zinc-800 pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Başlık */}
            <div>
              <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Başlık</label>
              <input value={card.title} onChange={e => set('title', e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            {/* Badge */}
            <div>
              <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Rozet Yazısı</label>
              <input value={card.badgeText} onChange={e => set('badgeText', e.target.value)}
                placeholder="ör. 1 Saatte Teklif"
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            {/* Etiket */}
            <div>
              <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Sağ Etiket</label>
              <input value={card.tag} onChange={e => set('tag', e.target.value)}
                placeholder="ör. Ücretsiz"
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            {/* CTA */}
            <div>
              <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Buton Metni</label>
              <input value={card.ctaText} onChange={e => set('ctaText', e.target.value)}
                placeholder="ör. Başla"
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500" />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">Açıklama</label>
            <textarea value={card.description} onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500 resize-none" />
          </div>

          {/* Özellikler */}
          <div>
            <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-2">Özellikler (3 madde)</label>
            <div className="space-y-2">
              {card.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-emerald-400" strokeWidth={3} />
                  </div>
                  <input value={f} onChange={e => setFeature(i, e.target.value)}
                    placeholder={`Özellik ${i + 1}`}
                    className="flex-1 bg-black/40 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-zinc-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Stat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">İstatistik Değeri</label>
              <input value={card.stat} onChange={e => set('stat', e.target.value)}
                placeholder="ör. 150+ veya %40"
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">İstatistik Etiketi</label>
              <input value={card.statLabel} onChange={e => set('statLabel', e.target.value)}
                placeholder="ör. Aktif Bayi"
                className="w-full bg-black/40 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { data: configData, isLoading } = useSiteConfig();
  const updateConfig = useUpdateSiteConfig();

  const [commissionRate,    setCommissionRate]    = useState('5');
  const [inactiveThreshold, setInactiveThreshold] = useState('10');
  const [featureCards,      setFeatureCards]      = useState<FeatureCardConfig[]>(DEFAULT_CARDS);
  const [saveState,         setSaveState]         = useState<'idle'|'saving'|'saved'|'error'>('idle');

  useEffect(() => {
    if (!configData?.settings) return;
    const s = configData.settings;
    if (s.defaultCommissionRate    !== undefined) setCommissionRate(String(s.defaultCommissionRate));
    if (s.inactivityThresholdDays  !== undefined) setInactiveThreshold(String(s.inactivityThresholdDays));
    if (s.featureCards?.length)                   setFeatureCards(s.featureCards as FeatureCardConfig[]);
  }, [configData]);

  const handleSave = async () => {
    setSaveState('saving');
    try {
      const current = configData?.settings ?? ({} as any);
      await updateConfig.mutateAsync({
        ...current,
        defaultCommissionRate:    Number(commissionRate),
        inactivityThresholdDays:  Number(inactiveThreshold),
        featureCards,
      });
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  const updateCard = (updated: FeatureCardConfig) =>
    setFeatureCards(prev => prev.map(c => c.id === updated.id ? updated : c));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-2xl">
      <div>
        <h2 className="text-white text-2xl font-light tracking-tight">Platform Ayarları</h2>
        <p className="text-zinc-500 text-sm mt-1">Genel platform konfigürasyonu</p>
      </div>

      {/* ── Öne Çıkan Kart Yönetimi ──────────────────────────────────────── */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
            <LayoutGrid size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-bold text-[15px]">Öne Çıkan Hizmet Kartları</h3>
            <p className="text-zinc-500 text-[12px]">Ana sayfadaki 3 hizmet kartının içeriğini düzenleyin</p>
          </div>
        </div>

        <div className="space-y-3">
          {featureCards.map(card => (
            <CardEditor key={card.id} card={card} onChange={updateCard} />
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-start gap-2">
          <AlertCircle size={14} className="text-zinc-500 flex-shrink-0 mt-0.5" />
          <p className="text-zinc-500 text-[11px] leading-relaxed">
            Kartların sırası ve renkleri sabittir. Başlık, açıklama, özellikler ve istatistikler düzenlenebilir.
            Bir kartı gizlemek için "Görünür" butonuna tıklayın.
          </p>
        </div>
      </div>

      {/* ── Komisyon Oranı ────────────────────────────────────────────────── */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/20">
            <Percent size={18} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-bold text-[15px]">Komisyon Oranı</h3>
            <p className="text-zinc-500 text-[12px]">Her satıştan alınan platform payı</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number" min="1" max="30" value={commissionRate}
            onChange={e => setCommissionRate(e.target.value)}
            className="w-24 bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
          />
          <span className="text-zinc-400 text-xl">%</span>
          <p className="text-zinc-500 text-sm ml-2">
            Bayi kazancının <strong className="text-zinc-300">%{commissionRate}</strong>'i platform payı olarak kesilir.
          </p>
        </div>
      </div>

      {/* ── Eylemsizlik Eşiği ─────────────────────────────────────────────── */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/20">
            <Bell size={18} className="text-sky-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-bold text-[15px]">Eylemsizlik Uyarısı</h3>
            <p className="text-zinc-500 text-[12px]">Kaç gün ürün eklenmezse bayi "Eylemsiz" sayılsın?</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number" min="1" max="90" value={inactiveThreshold}
            onChange={e => setInactiveThreshold(e.target.value)}
            className="w-24 bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500/50"
          />
          <span className="text-zinc-400">gün</span>
          <p className="text-zinc-500 text-sm ml-2">
            <strong className="text-zinc-300">{inactiveThreshold} gün</strong> boyunca ürün eklemeyen bayiler uyarı alır.
          </p>
        </div>
      </div>

      {/* ── Güvenlik ─────────────────────────────────────────────────────── */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/20">
            <Shield size={18} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-zinc-100 font-bold text-[15px]">Güvenlik</h3>
            <p className="text-zinc-500 text-[12px]">Platform güvenlik durumu</p>
          </div>
        </div>
        <div className="space-y-0 text-[13px]">
          {[
            ['Hız Sınırı (Rate Limiting)', 'Aktif — 200 istek/dak'],
            ['Otomatik Teklif Süresi', 'Aktif — her dakika cron'],
            ['JWT Kimlik Doğrulama', 'Aktif'],
            ['CORS Güvenliği', 'Aktif'],
            ['DTO Validation', 'Aktif — whitelist mode'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
              <span className="text-zinc-500">{label}</span>
              <span className="text-emerald-400 font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kaydet Butonu ────────────────────────────────────────────────── */}
      <button
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all w-fit disabled:opacity-60 disabled:cursor-not-allowed ${ saveState === 'saved' ? 'bg-emerald-500 text-white' : saveState === 'error' ? 'bg-red-500 text-white' : 'bg-white text-zinc-950 hover:bg-zinc-100' }`}
      >
        {saveState === 'saving' ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {saveState === 'saving' ? 'Kaydediliyor...' :
         saveState === 'saved'  ? 'Kaydedildi ✓'   :
         saveState === 'error'  ? 'Hata — Tekrar Dene' : 'Tüm Ayarları Kaydet'}
      </button>
    </div>
  );
}
