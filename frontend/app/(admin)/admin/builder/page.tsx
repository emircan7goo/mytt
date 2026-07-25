'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSiteConfig, useUpdateSiteConfig } from '@/lib/hooks/useSiteConfig';
import apiClient from '@/lib/api';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { FONT_CATALOG } from '@/components/ThemeInjector';
import { toast } from 'sonner';
import {
  Paintbrush, Monitor, LayoutDashboard, LayoutTemplate, CheckCircle2,
  Settings2, Save, Loader2, UploadCloud, Plus, Trash2, GripVertical,
  Check, RefreshCw, Smartphone, Tablet, Eye, X, Edit2, ImageIcon, Info,
  Sparkles,
} from 'lucide-react';

// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�
// Types
// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�
type Tab = 'theme' | 'header' | 'navbar' | 'homepage' | 'hero' | 'bubbles' | 'trustbar' | 'seo';
type Device = 'desktop' | 'tablet' | 'mobile';

const BG_OPTIONS = ['indigo', 'rose', 'emerald', 'amber', 'sky', 'violet', 'fuchsia', 'teal'];
const BG_LABELS: Record<string, string> = {
  indigo: 'Mavi', rose: 'Pembe', emerald: 'Yeşil', amber: 'Sarı',
  sky: 'Açık Mavi', violet: 'Mor', fuchsia: 'Fuşya', teal: '🌊',
};
const BG_GRADIENTS: Record<string, string> = {
  indigo:  'linear-gradient(145deg,#EEF2FF,#C7D2FE)',
  rose:    'linear-gradient(145deg,#FFF1F2,#FECDD3)',
  emerald: 'linear-gradient(145deg,#F5F3FF,#DDD6FE)',
  amber:   'linear-gradient(145deg,#FFFBEB,#FDE68A)',
  sky:     'linear-gradient(145deg,#EFF6FF,#BAE6FD)',
  violet:  'linear-gradient(145deg,#F5F3FF,#DDD6FE)',
  fuchsia: 'linear-gradient(145deg,#FDF4FF,#F5D0FE)',
  teal:    'linear-gradient(145deg,#F0FDFA,#99F6E4)',
};
const BG_EMOJIS: Record<string, string> = {
  indigo: '📘', rose: '🌺', emerald: '🌿', amber: '⭐',
  sky: '☁️', violet: '💜', fuchsia: '🌸', teal: '🌊',
};
const COLOR_PRESETS = [
  { label: 'Yeşil',   color: '#00B96B' },
  { label: 'Mavi',    color: '#3B82F6' },
  { label: 'Mor',     color: '#8B5CF6' },
  { label: 'Çivit',   color: '#6366F1' },
  { label: 'Turuncu', color: '#8B5CF6' },
  { label: 'Kırmızı', color: '#EF4444' },
  { label: 'Pembe',   color: '#EC4899' },
  { label: 'Teal',    color: '#14B8A6' },
];
const TRUST_ICONS = [
  'ShieldCheck', 'Truck', 'Star', 'Heart', 'Award', 'BadgeCheck',
  'Clock', 'CreditCard', 'Gift', 'Headphones', 'RefreshCw', 'Package',
  'Zap', 'ThumbsUp', 'Lock', 'Check',
];
const ICON_SIZES: Record<string, { cls: string; fit: string }> = {
  small:  { cls: 'w-[58%] h-[58%]',  fit: 'object-contain' },
  medium: { cls: 'w-[72%] h-[72%]',  fit: 'object-contain' },
  large:  { cls: 'w-[84%] h-[84%]',  fit: 'object-contain' },
  full:   { cls: 'w-full h-full',     fit: 'object-cover'   },
};

// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�
// Shared Sub-components
// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�

/** Image upload field */
function ImgField({ label, value, onChange, placeholder, dimensions, aspect = 'auto' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; dimensions?: string; aspect?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  // Yüklenen görselin piksel boyutunu ölç
  useEffect(() => {
    if (!value) { setImgSize(null); return; }
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setImgSize(null);
    img.src = value;
  }, [value]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      // ✅ Axios otomatik FormData header'larını ayarlar, manuel header zorunlu değil
      const { data } = await apiClient.post('/uploads/image', fd);
      if (data?.url) {
        onChange(data.url);
        const kb = Math.round(file.size / 1024);
        const mb = (file.size / (1024 * 1024)).toFixed(1);
        toast.success(`✅ Yüklendi �?? ${kb > 1024 ? `${mb} MB` : `${kb} KB`}`);
      } else {
        toast.error('�??� Sunucu URL döndürmedi.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Yükleme başarısız';
      toast.error(`�??� ${msg}`);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div>
      {/* Label + boyut badge */}
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">{label}</label>
        {dimensions && (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-purple-400/70 bg-purple-500/10 border border-purple-500/20 rounded-full px-2 py-0.5">
            <ImageIcon size={8} /> {dimensions}
          </span>
        )}
      </div>

      {/* URL input + Upload butonu */}
      <div className="flex gap-1.5">
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-[#0d1020] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-white/20"
          placeholder={placeholder || 'https://... veya dosya yükle ↑'} />
        <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" ref={ref} onChange={upload} className="hidden" />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="px-3 h-9 bg-purple-600/15 border border-purple-500/30 rounded-lg flex items-center gap-1.5 text-purple-400 hover:bg-purple-600/25 hover:border-purple-500/50 transition-all disabled:opacity-50 flex-shrink-0 text-[11px] font-bold"
          title="Bilgisayardan Yükle">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
          {busy ? 'Yükleniyor' : 'Yükle'}
        </button>
      </div>

      {/* Önizleme */}
      {value && (
        <div
          className="mt-2 rounded-lg border border-white/10 overflow-hidden bg-[#0d1020] flex items-center justify-center"
          style={{ aspectRatio: aspect !== 'auto' ? aspect : undefined, minHeight: aspect === 'auto' ? 56 : undefined, maxHeight: aspect === 'auto' ? 64 : 160 }}>
          <img src={resolveUploadUrl(value)} alt="" className="max-w-full max-h-full object-contain" style={{ maxHeight: aspect === 'auto' ? 56 : 160 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Yüklenen görselin gerçek piksel boyutu */}
      {value && imgSize && (
        <p className="mt-1 text-[9px] text-white/30 flex items-center gap-1">
          <Info size={8} />
          Gerçek boyut: <span className="text-white/50 font-bold">{imgSize.w} × {imgSize.h} px</span>
          {dimensions && imgSize.w > 0 && (
            <span className="ml-1 text-white/25">�?? Önerilen: {dimensions}</span>
          )}
        </p>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold text-purple-300/60 uppercase tracking-widest mb-1.5 block">{children}</label>;
}

function TInput({ value, onChange, placeholder, type = 'text', rows }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-[#0d1020] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-white/20 resize-none";
  if (rows) return <textarea value={value} onChange={e => onChange(e.target.value)} className={cls} placeholder={placeholder} rows={rows} />;
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} className={cls} placeholder={placeholder} />;
}

function Divider({ label }: { label?: string }) {
  if (label) return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 border-t border-white/[0.06]" />
      <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{label}</span>
      <div className="flex-1 border-t border-white/[0.06]" />
    </div>
  );
  return <div className="border-t border-white/[0.06] my-5" />;
}

function SectionTitle({ icon, children, hint }: { icon?: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-400 to-purple-600 flex-shrink-0" />
        {icon && <span className="text-sm leading-none">{icon}</span>}
        <h3 className="text-[13px] font-bold text-white tracking-tight">{children}</h3>
      </div>
      {hint && <p className="text-[10px] text-white/30 mt-1 pl-3">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: {
  label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 py-3 border-b border-white/[0.05] last:border-0 cursor-pointer select-none group"
      onClick={() => onChange(!checked)}>
      <div>
        <p className="text-[12px] font-semibold text-white/75 group-hover:text-white/90 transition-colors">{label}</p>
        {sub && <p className="text-[10px] text-white/25 mt-0.5">{sub}</p>}
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${checked ? 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]' : 'bg-white/10'}`}
        style={{ minWidth: 44 }}>
        <span className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[22px] bg-white' : 'translate-x-1 bg-white/70'}`} />
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? 'px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all bg-purple-600/25 border-purple-500/60 text-purple-300' : 'px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}>
      {label}
    </button>
  );
}

// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�
// Tab Panels
// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�

function ThemeTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-5 pb-4">
      <SectionTitle icon="?�??�">Renk ve Yazı Tipi</SectionTitle>

      {/* Ana Marka Rengi */}
      <div>
        <Label>Ana Marka Rengi</Label>
        <div className="flex gap-2 items-stretch mb-2">
          <div className="relative flex-shrink-0">
            <input
              type="color"
              value={draft.primaryColor || '#00B96B'}
              onChange={(e) => update('primaryColor', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Renk Seç"
            />
            <div
              className="w-12 h-10 rounded-lg border-2 border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105"
              style={{ background: draft.primaryColor || '#00B96B', boxShadow: `0 0 12px ${draft.primaryColor || '#00B96B'}55` }}
            />
          </div>
          <TInput value={draft.primaryColor || '#00B96B'} onChange={(v) => update('primaryColor', v)} placeholder="#00B96B" />
        </div>
        {/* Hızlı Renk Paleti */}
        <div className="flex flex-wrap gap-2 p-2.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
          {COLOR_PRESETS.map(({ label, color }) => (
            <button
              key={color}
              type="button"
              title={label}
              onClick={() => update('primaryColor', color)}
              className="group relative"
            >
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all group-hover:scale-110 ${(draft.primaryColor || '#00B96B').toLowerCase() === color.toLowerCase() ? 'border-white scale-110 shadow-lg' : 'border-white/20'}`}
                style={{ background: color }}
              />
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-white/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Ailesi �?? 20 font kart seçici */}
      <div>
        <Label>Font Ailesi</Label>
        <div className="grid grid-cols-2 gap-1.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-0.5">
          {Object.entries(FONT_CATALOG).map(([name, def]) => {
            const active = (draft.fontFamily || 'Outfit') === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => update('fontFamily', name)}
                className={active ? 'text-left px-2.5 py-2 rounded-lg border transition-all bg-purple-600/20 border-purple-500/50' : 'text-left px-2.5 py-2 rounded-lg border transition-all bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'}
              >
                <p
                  className="text-[13px] font-semibold leading-tight"
                  style={{
                    fontFamily: `${name}, sans-serif`,
                    color: active ? '#c4b5fd' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {name}
                </p>
                <p className="text-[9px] text-white/30 mt-0.5 leading-tight">{def.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metin Ölçeği */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Metin Büyüklüğü</Label>
          <span className="text-[11px] font-bold text-purple-300">
            {((draft.textScale ?? 1.0) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => update('textScale', Math.max(0.8, Number(((draft.textScale ?? 1.0) - 0.05).toFixed(2))))}
            className="w-8 h-8 flex-shrink-0 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold text-base leading-none"
          >
            −
          </button>
          <input
            type="range" min="0.80" max="1.30" step="0.05"
            value={draft.textScale ?? 1.0}
            onChange={(e) => update('textScale', Number(e.target.value))}
            className="flex-1 accent-purple-500 bg-white/10 rounded-full appearance-none h-1.5 outline-none"
          />
          <button
            type="button"
            onClick={() => update('textScale', Math.min(1.3, Number(((draft.textScale ?? 1.0) + 0.05).toFixed(2))))}
            className="w-8 h-8 flex-shrink-0 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all font-bold text-base leading-none"
          >
            +
          </button>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-white/20">80%</span>
          <button
            type="button"
            onClick={() => update('textScale', 1.0)}
            className="text-[9px] text-white/25 hover:text-purple-400 transition-colors"
          >
            Sıfırla
          </button>
          <span className="text-[9px] text-white/20">130%</span>
        </div>
      </div>

      {/* Tasarım Yoğunluğu */}
      <div>
        <Label>Tasarım Yoğunluğu (Density)</Label>
        <select
          value={draft.layoutDensity || 'standard'}
          onChange={(e) => update('layoutDensity', e.target.value)}
          className="w-full bg-[#1a1d2a] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/50 appearance-none">
          <option className="bg-[#1a1d2a] text-white" value="compact">Kompakt (Çok içerik sığar)</option>
          <option className="bg-[#1a1d2a] text-white" value="standard">Standart (Dengeli)</option>
          <option className="bg-[#1a1d2a] text-white" value="loose">Ferah (Geniş Apple stili boşluklar)</option>
        </select>
      </div>

      {/* Buton Stili */}
      <div>
        <Label>Buton Stili</Label>
        <select
          value={draft.buttonStyle || 'pill'}
          onChange={(e) => update('buttonStyle', e.target.value)}
          className="w-full bg-[#1a1d2a] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/50 appearance-none">
          <option className="bg-[#1a1d2a] text-white" value="pill">�?? Oval (Pill)</option>
          <option className="bg-[#1a1d2a] text-white" value="rounded">▣ Kavisli (Rounded)</option>
          <option className="bg-[#1a1d2a] text-white" value="sharp">■ Keskin Köşe (Sharp)</option>
          <option className="bg-[#1a1d2a] text-white" value="soft-shadow">�??�?? Soft Gölge</option>
          <option className="bg-[#1a1d2a] text-white" value="neo-brutalism">⬛ Neo-Brutalism</option>
          <option className="bg-[#1a1d2a] text-white" value="flat">�??� Düz (Flat)</option>
        </select>
      </div>

      {/* Cam Efekti */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label>Cam-Mimarisi (Glass Blur)</Label>
          <span className="text-[10px] text-white/50">{draft.glassmorphismLevel ?? 20}px</span>
        </div>
        <input
          type="range" min="0" max="40" step="1"
          value={draft.glassmorphismLevel ?? 20}
          onChange={(e) => update('glassmorphismLevel', Number(e.target.value))}
          className="w-full accent-purple-500 bg-white/10 rounded-full appearance-none h-1.5 outline-none"
        />
      </div>

      {/* Animasyon Hızı */}
      <div>
        <Label>Animasyon Hızı</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { val: 'instant', label: '⚡ Anında' },
            { val: 'smooth',  label: '?��� Akıcı' },
            { val: 'cinematic', label: '?�??� Sinematik' },
          ].map(({ val, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => update('animationSpeed', val)}
              className={`py-2 px-1 text-[10px] font-bold border transition-all rounded-lg ${(draft.animationSpeed || 'smooth') === val ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <Divider />
      <SectionTitle icon="?����???���">Geliştirici</SectionTitle>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label>Özel CSS Kodları</Label>
        </div>
        <TInput
          value={draft.customCss || ''}
          onChange={(v) => update('customCss', v)}
          placeholder="body { background: red; }"
          rows={3}
        />
        <p className="text-[10px] text-white/30 mt-1">Sadece gelişmiş kullanıcılar içindir. Yanlış kod siteyi bozabilir.</p>
      </div>

      <Divider />
      <SectionTitle icon="?���">Görünüm Modu</SectionTitle>
      <ToggleRow
        label="Karanlık Mod (Dark Mode)"
        sub="Gövde arka planı koyulaşır"
        checked={draft.enableDarkMode || false}
        onChange={(v) => update('enableDarkMode', v)}
      />
    </div>
  );
}


function HeaderTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  const categories = draft.categories || [];
  const setCategories = (v: any[]) => update('categories', v);
  const tickerLength = (draft.ticker || '').length;

  return (
    <div className="space-y-5 pb-4">
      <SectionTitle icon="?����??">Logo & Favicon</SectionTitle>
      <ImgField label="Header Logosu" value={draft.logoUrl || ''} onChange={(v) => update('logoUrl', v)} dimensions="200 × 80 px �?? Saydam PNG" aspect="auto" />
      <ImgField label="Tarayıcı Favicon'u" value={draft.faviconUrl || ''} onChange={(v) => update('faviconUrl', v)} dimensions="128 × 128 px �?? PNG/ICO" aspect="1/1" />

      <Divider />
      <SectionTitle icon="?���">Kayan Duyuru �??eridi</SectionTitle>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <Label>Duyuru Metni</Label>
          <span className={`text-[10px] font-bold ${tickerLength > 200 ? 'text-red-400' : 'text-white/30'}`}>{tickerLength}/300</span>
        </div>
        <TInput
          value={draft.ticker || ''}
          onChange={(v) => update('ticker', v)}
          placeholder="?�??� Kampanya | ?�???? Hediye | ?��� Ücretsiz Kargo"
          rows={3}
        />
        <p className="text-[10px] text-white/25 mt-1">Farklı mesajları | ile ayırın</p>
      </div>

      <Divider />
      <SectionTitle icon="?�??�">Navbar Linkleri</SectionTitle>
      <div className="space-y-1.5">
        {categories.map((cat: any, idx: number) => (
          <div key={idx} className="flex gap-1.5 items-center bg-white/5 border border-white/10 rounded-lg p-2">
            <GripVertical size={12} className="text-white/20 flex-shrink-0" />
            <input
              value={cat.name}
              onChange={e => { const a = [...categories]; a[idx] = { ...a[idx], name: e.target.value }; setCategories(a); }}
              className="flex-1 bg-transparent text-[12px] text-white outline-none min-w-0"
              placeholder="Kategori Adı"
            />
            <button onClick={() => setCategories(categories.filter((_: any, i: number) => i !== idx))} className="text-white/20 hover:text-red-400 transition-colors">
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setCategories([...categories, { name: 'Yeni Link', icon: null }])}
          className="w-full py-2 border border-dashed border-white/10 rounded-lg text-[11px] text-white/30 hover:text-white/60 hover:border-white/20 transition-all flex items-center justify-center gap-1">
          <Plus size={11} /> Link Ekle
        </button>
      </div>

      <Divider />
      <SectionTitle icon="?���">İletişim Bilgileri</SectionTitle>
      <div className="space-y-3">
        <div>
          <Label>WhatsApp Hattı</Label>
          <TInput value={draft.whatsappNumber || ''} onChange={(v) => update('whatsappNumber', v)} placeholder="+90 555 123 45 67" />
        </div>
        <ToggleRow
          label="Floating WhatsApp Balonu"
          sub="Sitenin sağ alt köşesinde uçan buton"
          checked={draft.floatingWhatsApp ?? true}
          onChange={(v) => update('floatingWhatsApp', v)}
        />
        <div>
          <Label>Destek E-Posta</Label>
          <TInput value={draft.contactEmail || ''} onChange={(v) => update('contactEmail', v)} placeholder="destek@..." />
        </div>
        <div>
          <Label>Footer Telif Metni</Label>
          <TInput value={draft.footerText || ''} onChange={(v) => update('footerText', v)} placeholder="© 2026 Mytt" />
        </div>
      </div>
    </div>
  );
}

function HomepageTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  return (
    <div className="space-y-2 pb-4">
      <SectionTitle icon="?�??�">Anasayfa Modülleri</SectionTitle>
      <p className="text-[11px] text-white/30 mb-4 -mt-2">Aşağıdaki blokları görünür / gizli yapın.</p>
      <ToggleRow
        label="Hero Slider Büyük Banner"
        sub="Anasayfanın tepesindeki büyük görselli banner"
        checked={draft.showHeroSlider ?? true}
        onChange={(v) => update('showHeroSlider', v)}
      />
      <ToggleRow
        label="Servis Baloncukları"
        sub="EasyCep tarzı küçük yuvarlak ikonlar"
        checked={draft.showServiceBubbles ?? true}
        onChange={(v) => update('showServiceBubbles', v)}
      />
      <ToggleRow
        label="Güven �??eridi"
        sub="Kargo, garanti, iade gibi maddeler"
        checked={draft.showTrustBar ?? true}
        onChange={(v) => update('showTrustBar', v)}
      />
      <Divider />
      <SectionTitle icon="?��??�??">Ürün ve Etkileşim</SectionTitle>
      <div>
        <Label>Ürün Kartı Stili</Label>
        <select
          value={draft.productCardStyle || 'detailed'}
          onChange={(e) => update('productCardStyle', e.target.value)}
          className="w-full bg-[#1a1d2a] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/50 appearance-none mb-3">
          <option className="bg-[#1a1d2a] text-white" value="detailed">Detaylı (Batarya, Kozmetik yazar)</option>
          <option className="bg-[#1a1d2a] text-white" value="minimal">Minimal (Sadece resim ve fiyat)</option>
        </select>
      </div>
      <ToggleRow
        label="Nabız (Pulse) CTA"
        sub="Ana butonlarda tıklamayı artıran nabız efekti"
        checked={draft.enablePulseCTA ?? false}
        onChange={(v) => update('enablePulseCTA', v)}
      />
      <ToggleRow
        label="Bakım Modu (Maintenance)"
        sub="Siteyi ziyaretçilere kapatır, sadece admin görebilir"
        checked={draft.maintenanceMode ?? false}
        onChange={(v) => update('maintenanceMode', v)}
      />
    </div>
  );
}

// Örnek slide'lar �?? gradient arkaplan, resim gerekmez
const SAMPLE_SLIDES = [
  {
    imageUrl: 'linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 50%, #1a1a2e 100%)',
    title: 'Güvenle Al, Güvenle Sat.',
    subtitle: "Türkiye'nin en güvenilir yenilenmiş telefon pazaryeri. Her cihaz test edilmiş, her satış güvence altında.",
    btnLeftText: 'Cihazları Keşfet', btnLeftLink: '/',
    btnRightText: 'Bayi Ol',         btnRightLink: '/register-dealer',
    textColor: '#f5f5f7', textAlignment: 'left', overlayOpacity: 0,
    animationType: 'fade', buttonStyle: 'solid', order: 0, isActive: true,
  },
  {
    imageUrl: 'linear-gradient(135deg, #1428A0 0%, #0d1f7b 60%, #06103d 100%)',
    title: 'Samsung Galaxy Serisi',
    subtitle: 'En yeni Galaxy modelleri uzman onaylı kalite güvencesiyle.',
    btnLeftText: 'Samsung Gör',    btnLeftLink: '/?cat=Samsung',
    btnRightText: 'Tüm Cihazlar', btnRightLink: '/',
    textColor: '#ffffff', textAlignment: 'left', overlayOpacity: 0,
    animationType: 'fade', buttonStyle: 'solid', order: 1, isActive: true,
  },
  {
    imageUrl: 'linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)',
    title: 'iPhone �?? Elite Kalite',
    subtitle: 'A+ ve A Kalite iPhone modelleri. Kutulu, garantili, sıfır farkıyla.',
    btnLeftText: 'iPhone Gör',     btnLeftLink: '/?cat=Apple',
    btnRightText: 'Nasıl Çalışır', btnRightLink: '/',
    textColor: '#1d1d1f', textAlignment: 'left', overlayOpacity: 0,
    animationType: 'fade', buttonStyle: 'solid', order: 2, isActive: true,
  },
] as const;

function HeroTab({ heroSlides, setHeroSlides, onEditingChange }: { heroSlides: any[]; setHeroSlides: (v: any[]) => void; onEditingChange: (v: any) => void }) {
  const [editing, _setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const setEditing = (v: any) => {
    _setEditing(v);
    onEditingChange(v);
  };

  const refetch = async () => {
    try {
      const { data } = await apiClient.get('/hero-slides/admin');
      setHeroSlides(data);
    } catch (err: any) {
      console.error('Hero slides yüklenemedi:', err?.response?.data || err?.message);
    }
  };

  const seedSamples = async () => {
    if (!confirm('3 adet örnek slide oluşturulsun mu? Mevcut slaytlar korunur.')) return;
    setSeeding(true);
    try {
      for (const slide of SAMPLE_SLIDES) {
        await apiClient.post('/hero-slides', slide);
      }
      toast.success('3 örnek slide oluşturuldu!');
      refetch();
    } catch (err: any) {
      const d = err?.response?.data;
      const inner = d?.error;
      const msg = d?.message ?? (typeof inner === 'string' ? inner : inner?.message) ?? 'Oluşturulamadı';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSeeding(false);
    }
  };

  const saveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // DTO-uyumlu payload: id/createdAt/updatedAt gibi fazla alanları dışla
      // (backend main.ts'de forbidNonWhitelisted:true → fazla alan = 400 hatası)
      const payload: Record<string, unknown> = {
        imageUrl: editing.imageUrl || '',
        title: editing.title || '',
        subtitle: editing.subtitle || '',
        btnLeftText: editing.btnLeftText || '',
        btnLeftLink: editing.btnLeftLink || '',
        btnRightText: editing.btnRightText || '',
        btnRightLink: editing.btnRightLink || '',
        textColor: editing.textColor || '#ffffff',
        textAlignment: editing.textAlignment || 'left',
        overlayOpacity: Number(editing.overlayOpacity ?? 40),
        animationType: editing.animationType || 'fade',
        buttonStyle: editing.buttonStyle || 'solid',
        order: Number(editing.order ?? 0),
        isActive: editing.isActive ?? true,
      };

      if (editing.id) {
        await apiClient.patch(`/hero-slides/${editing.id}`, payload);
        toast.success('Slide güncellendi');
      } else {
        await apiClient.post('/hero-slides', payload);
        toast.success('Yeni slide eklendi');
      }
      setEditing(null);
      refetch();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(' • ') : (raw || 'Kaydedilemedi');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Bu slide\'ı silmek istediğinizden emin misiniz?')) return;
    try {
      await apiClient.delete(`/hero-slides/${id}`);
      toast.success('Silindi');
      refetch();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const msg = Array.isArray(raw) ? raw.join(' • ') : (raw || 'Silinemedi');
      toast.error(msg);
    }
  };

  if (editing) {
    return (
      <div className="pb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[13px] font-bold text-white">{editing.id ? 'Slide Düzenle' : 'Yeni Slide'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-white/30 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={saveSlide} className="space-y-4">
          <ImgField label="Slide Görseli" value={editing.imageUrl || ''} onChange={(v) => setEditing({ ...editing, imageUrl: v })} dimensions="1920 × 800 px �?? 21:9 Geniş" aspect="21/9" />
          <div>
            <Label>Başlık</Label>
            <TInput value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Kusursuz Apple Deneyimi" />
          </div>
          <div>
            <Label>Alt Başlık</Label>
            <TInput value={editing.subtitle || ''} onChange={(v) => setEditing({ ...editing, subtitle: v })} placeholder="Garantili refurbished cihazlar..." rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Sol Buton Yazısı</Label>
              <TInput value={editing.btnLeftText || ''} onChange={(v) => setEditing({ ...editing, btnLeftText: v })} placeholder="Keşfet" />
            </div>
            <div>
              <Label>Sol Buton URL</Label>
              <TInput value={editing.btnLeftLink || ''} onChange={(v) => setEditing({ ...editing, btnLeftLink: v })} placeholder="/" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Sağ Buton Yazısı</Label>
              <TInput value={editing.btnRightText || ''} onChange={(v) => setEditing({ ...editing, btnRightText: v })} placeholder="Takas" />
            </div>
            <div>
              <Label>Sağ Buton URL</Label>
              <TInput value={editing.btnRightLink || ''} onChange={(v) => setEditing({ ...editing, btnRightLink: v })} placeholder="/takas" />
            </div>
          </div>

          {/* �??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�?? */}
          {/* Customization Section */}
          {/* �??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�??�?? */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Özelleştirme</p>

            {/* Metin Rengi */}
            <div className="mb-3">
              <Label>Metin Rengi</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={editing.textColor || '#ffffff'}
                  onChange={(e) => setEditing({ ...editing, textColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/20"
                />
                <input
                  type="text"
                  value={editing.textColor || '#ffffff'}
                  onChange={(e) => setEditing({ ...editing, textColor: e.target.value })}
                  className="flex-1 bg-[#0d1020] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Metin Hizalaması */}
            <div className="mb-3">
              <Label>Metin Hizalaması</Label>
              <div className="flex gap-1.5">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <Chip
                    key={align}
                    label={align === 'left' ? '�?? Sol' : align === 'center' ? '�?? Merkez' : 'Sağ →'}
                    active={editing.textAlignment === align}
                    onClick={() => setEditing({ ...editing, textAlignment: align })}
                  />
                ))}
              </div>
            </div>

            {/* Overlay Opaklığı */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <Label>Arkaplan Karartması</Label>
                <span className="text-[10px] text-white/40 font-semibold">{editing.overlayOpacity ?? 40}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={editing.overlayOpacity ?? 40}
                onChange={(e) => setEditing({ ...editing, overlayOpacity: Number(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Animasyon Tipi */}
            <div className="mb-3">
              <Label>Animasyon Tipi</Label>
              <div className="flex gap-1.5">
                {(['fade', 'slide', 'zoom'] as const).map((anim) => (
                  <Chip
                    key={anim}
                    label={anim === 'fade' ? '�?? Solma' : anim === 'slide' ? '→ Kaydırma' : '⊙ Yakınlaş'}
                    active={editing.animationType === anim}
                    onClick={() => setEditing({ ...editing, animationType: anim })}
                  />
                ))}
              </div>
            </div>

            {/* Buton Stili */}
            <div className="mb-3">
              <Label>Buton Stili</Label>
              <div className="flex gap-1.5">
                {(['solid', 'outline'] as const).map((style) => (
                  <Chip
                    key={style}
                    label={style === 'solid' ? '■ Dolu' : '□ Çizgili'}
                    active={editing.buttonStyle === style}
                    onClick={() => setEditing({ ...editing, buttonStyle: style })}
                  />
                ))}
              </div>
            </div>
          </div>

          <ToggleRow label="Aktif" sub="Sitede görünsün mü?" checked={editing.isActive ?? true} onChange={(v) => setEditing({ ...editing, isActive: v })} />
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 text-white text-[13px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/30"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {editing.id ? 'Güncelle' : 'Slide Ekle'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle icon="?����??">Hero Slider</SectionTitle>
        <div className="flex gap-1.5">
          {heroSlides.length === 0 && (
            <button
              onClick={seedSamples}
              disabled={seeding}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-lg hover:bg-amber-600/30 transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              Örnek
            </button>
          )}
          <button
            onClick={() => setEditing({
              imageUrl: '', title: '', subtitle: '',
              btnLeftText: '', btnLeftLink: '',
              btnRightText: '', btnRightLink: '',
              textColor: '#ffffff', textAlignment: 'left',
              overlayOpacity: 40, animationType: 'fade',
              buttonStyle: 'solid', order: heroSlides.length, isActive: true,
            })}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold rounded-lg hover:bg-purple-600/30 transition-colors">
            <Plus size={11} /> Ekle
          </button>
        </div>
      </div>
      {/* Piksel bilgisi */}
      <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-purple-500/[0.07] border border-purple-500/20 rounded-lg">
        <ImageIcon size={11} className="text-purple-400 flex-shrink-0" />
        <p className="text-[10px] text-purple-300/70">Önerilen boyut: <span className="font-bold text-purple-300">1920 × 800 px</span> �?? JPEG/WebP</p>
      </div>

      <div className="space-y-2">
        {heroSlides.map((slide, i) => (
          <div key={slide.id} className={`flex gap-2 items-center border rounded-xl p-2.5 transition-all group ${!slide.isActive ? 'opacity-40 border-white/[0.05] bg-white/[0.02]' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'}`}>
            {/* Thumbnail */}
            <div className="w-16 h-11 rounded-lg overflow-hidden bg-white/[0.06] flex-shrink-0 border border-white/[0.06]">
              {slide.imageUrl
                ? <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={14} /></div>}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-white/20 bg-white/5 px-1.5 py-0.5 rounded">#{i + 1}</span>
                {!slide.isActive && <span className="text-[9px] text-amber-400/60 bg-amber-500/10 px-1.5 py-0.5 rounded">Gizli</span>}
              </div>
              <p className="text-[12px] font-bold text-white/80 truncate mt-0.5">{slide.title || '�??'}</p>
              <p className="text-[10px] text-white/25 truncate">{slide.subtitle || 'Alt başlık yok'}</p>
            </div>
            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(slide)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-purple-500/20 flex items-center justify-center text-white/40 hover:text-purple-300 transition-all"><Edit2 size={11} /></button>
              <button onClick={() => deleteSlide(slide.id)} className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400/60 hover:text-red-400 transition-all"><Trash2 size={11} /></button>
            </div>
          </div>
        ))}
        {heroSlides.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-white/[0.08] rounded-xl space-y-3">
            <ImageIcon size={24} className="text-white/15 mx-auto" />
            <p className="text-[12px] text-white/25">Henüz slide eklenmemiş</p>
            <button
              onClick={seedSamples}
              disabled={seeding}
              className="mx-auto flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {seeding ? 'Oluşturuluyor...' : '✨ 3 Örnek Slide Oluştur'}
            </button>
            <p className="text-[10px] text-white/15">veya yukarıdaki "Ekle" butonuna tıklayın</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BubblesTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  const bubbles = draft.serviceBubbles || [];
  const setBubbles = (v: any[]) => update('serviceBubbles', v);
  const ringColor = draft.bubbleRingColor || '#22c55e';
  const bubbleSize = draft.bubbleSize || 'md';

  const BUBBLE_SIZE_OPTIONS = [
    { key: 'sm', label: 'Küçük',  px: '60px' },
    { key: 'md', label: 'Orta',   px: '76px' },
    { key: 'lg', label: 'Büyük',  px: '92px' },
    { key: 'xl', label: 'XL',     px: '108px' },
  ];

  return (
    <div className="pb-4">
      {/* Balon Boyutu */}
      <div className="mb-4 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl">
        <Label>Balon Boyutu (Kutu + Yazı birlikte büyür)</Label>
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {BUBBLE_SIZE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => update('bubbleSize', opt.key)}
              className={`py-2 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-0.5 ${ bubbleSize === opt.key ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300' : 'bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white/60' }`}
            >
              <span style={{ fontSize: opt.key === 'sm' ? 12 : opt.key === 'md' ? 15 : opt.key === 'lg' ? 18 : 22 }}>⬛</span>
              <span>{opt.label}</span>
              <span className="text-white/25">{opt.px}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Halka Rengi */}
      <div className="mb-5 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl">
        <Label>Halka Rengi (Glow)</Label>
        <div className="flex gap-2 items-center mt-1.5">
          <div className="relative flex-shrink-0">
            <input
              type="color"
              value={ringColor}
              onChange={(e) => update('bubbleRingColor', e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-10 h-8 rounded-lg border-2 border-white/20 cursor-pointer"
              style={{ background: ringColor, boxShadow: `0 0 10px ${ringColor}88` }}
            />
          </div>
          <TInput value={ringColor} onChange={(v) => update('bubbleRingColor', v)} placeholder="#22c55e" />
          <div
            className="w-8 h-8 rounded-full border-[3px] flex-shrink-0"
            style={{ borderColor: ringColor, boxShadow: `0 0 8px ${ringColor}99` }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['#22c55e','#0ea5e9','#a855f7','#f59e0b','#ef4444','#ec4899','#14b8a6','#8B5CF6'].map(c => (
            <button key={c} type="button" onClick={() => update('bubbleRingColor', c)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${ringColor === c ? 'border-white scale-110' : 'border-white/20'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <SectionTitle icon="?���">Servis Baloncukları</SectionTitle>
        <button
          onClick={() => setBubbles([...bubbles, { id: Date.now(), title1: 'Yeni', title2: 'Özellik', iconUrl: '', link: '/', bg: 'indigo' }])}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold rounded-lg hover:bg-purple-600/30 transition-colors">
          <Plus size={11} /> Ekle
        </button>
      </div>
      <div className="space-y-3">
        {bubbles.map((b: any, idx: number) => (
          <div key={b.id || idx} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
            {/* Başlık + Sil */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-white/60">{b.title1} {b.title2}</p>
              <button onClick={() => setBubbles(bubbles.filter((_: any, i: number) => i !== idx))} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
            </div>

            {/* Canlı Mini Önizleme */}
            <div className="flex items-center gap-4 py-3 px-4 bg-gradient-to-r from-white/[0.04] to-transparent rounded-xl border border-white/[0.08]">
              <div
                className="w-[76px] h-[76px] rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white/80 shadow-lg overflow-hidden relative"
                style={{ background: BG_GRADIENTS[b.bg] || BG_GRADIENTS.indigo }}>
                {b.iconUrl ? (
                  <img
                    src={resolveUploadUrl(b.iconUrl)}
                    alt=""
                    className={`${ICON_SIZES[b.iconSize || 'large'].cls} ${ICON_SIZES[b.iconSize || 'large'].fit}`}
                  />
                ) : (
                  <span className="text-[28px] select-none leading-none">{BG_EMOJIS[b.bg] ?? '✨'}</span>
                )}
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.35) 0%,transparent 55%)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/60 font-medium leading-tight truncate">{b.title1 || '1. Satır'}</p>
                <p className="text-[13px] font-bold leading-tight text-purple-300 truncate">{b.title2 || '2. Satır'}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BG_GRADIENTS[b.bg] }} />
                  <span className="text-[9px] text-white/30">{BG_LABELS[b.bg] || b.bg} · Canlı Önizleme</span>
                </div>
              </div>
            </div>

            <ImgField label="Baloncuk Görseli" value={b.iconUrl || ''} onChange={(v) => { const a = [...bubbles]; a[idx] = { ...a[idx], iconUrl: v }; setBubbles(a); }} dimensions="100 × 100 px �?? �??effaf PNG" aspect="1/1" />

            {/* Resim Boyutu */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Resim Boyutu</Label>
                {(b.iconSize === 'full' || (!b.iconSize && false)) && (
                  <span className="text-[9px] text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                    Tam → object-cover (kırpar)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { val: 'small',  label: 'Küçük', sub: '58%' },
                  { val: 'medium', label: 'Orta',  sub: '72%' },
                  { val: 'large',  label: 'Büyük', sub: '84%' },
                  { val: 'full',   label: 'Tam',   sub: '100%' },
                ].map(({ val, label, sub }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { const a = [...bubbles]; a[idx] = { ...a[idx], iconSize: val }; setBubbles(a); }}
                    className={`py-2 flex flex-col items-center gap-0.5 border transition-all rounded-lg ${(b.iconSize || 'large') === val ? 'bg-purple-600/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'}`}>
                    <span className="text-[10px] font-bold">{label}</span>
                    <span className="text-[8px] opacity-60">{sub}</span>
                  </button>
                ))}
              </div>
              {b.iconSize === 'full' && (
                <p className="mt-1 text-[9px] text-amber-400/60">Tam boyut görseli daire içini tamamen doldurur; kare/yuvarlak görseller için idealdir.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>1. Satır</Label>
                <TInput value={b.title1} onChange={(v) => { const a = [...bubbles]; a[idx] = { ...a[idx], title1: v }; setBubbles(a); }} />
              </div>
              <div>
                <Label>2. Satır (Kalın)</Label>
                <TInput value={b.title2} onChange={(v) => { const a = [...bubbles]; a[idx] = { ...a[idx], title2: v }; setBubbles(a); }} />
              </div>
              <div>
                <Label>Hedef URL</Label>
                <TInput value={b.link} onChange={(v) => { const a = [...bubbles]; a[idx] = { ...a[idx], link: v }; setBubbles(a); }} />
              </div>
              <div>
                <Label>Arka Plan Rengi</Label>
                <select
                  value={b.bg}
                  onChange={(e) => { const a = [...bubbles]; a[idx] = { ...a[idx], bg: e.target.value }; setBubbles(a); }}
                  className="w-full bg-[#1a1d2a] border border-white/10 rounded-lg px-2 py-2 text-[12px] text-white outline-none focus:border-purple-500/50 appearance-none">
                  {BG_OPTIONS.map(opt => <option key={opt} className="bg-[#1a1d2a] text-white" value={opt}>{BG_LABELS[opt]}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustBarTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  const bar = draft.trustBar || [];
  const setBar = (v: any[]) => update('trustBar', v);

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle icon="?����??">Güven �??eridi</SectionTitle>
        <button
          onClick={() => setBar([...bar, { icon: 'ShieldCheck', title: 'Yeni Madde', desc: 'Açıklama...' }])}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold rounded-lg hover:bg-purple-600/30 transition-colors">
          <Plus size={11} /> Ekle
        </button>
      </div>
      <div className="space-y-2">
        {bar.map((item: any, idx: number) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-white/60">{item.title}</p>
              <button onClick={() => setBar(bar.filter((_: any, i: number) => i !== idx))} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
            </div>
            <div className="space-y-2">
              <div>
                <Label>İkon Seç (Lucide)</Label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {TRUST_ICONS.map(ico => (
                    <button
                      key={ico}
                      type="button"
                      onClick={() => { const a = [...bar]; a[idx] = { ...a[idx], icon: ico }; setBar(a); }}
                      className={`px-2 py-0.5 text-[9px] font-bold border rounded-md transition-all ${item.icon === ico ? 'bg-purple-600/30 border-purple-500/60 text-purple-300' : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'}`}>
                      {ico}
                    </button>
                  ))}
                </div>
                <TInput value={item.icon} onChange={(v) => { const a = [...bar]; a[idx] = { ...a[idx], icon: v }; setBar(a); }} placeholder="ShieldCheck" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Başlık</Label>
                  <TInput value={item.title} onChange={(v) => { const a = [...bar]; a[idx] = { ...a[idx], title: v }; setBar(a); }} />
                </div>
                <div>
                  <Label>Alt Metin</Label>
                  <TInput value={item.desc} onChange={(v) => { const a = [...bar]; a[idx] = { ...a[idx], desc: v }; setBar(a); }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  const titleLen = (draft.siteTitle || '').length;
  const descLen = (draft.siteDesc || '').length;

  return (
    <div className="space-y-4 pb-4">
      <SectionTitle icon="⚙�??">SEO Ayarları</SectionTitle>

      <div>
        <div className="flex justify-between">
          <Label>Site Ana Başlığı</Label>
          <span className={`text-[10px] font-bold ${titleLen > 60 ? 'text-red-400' : 'text-white/30'}`}>{titleLen}/60</span>
        </div>
        <TInput value={draft.siteTitle || ''} onChange={(v) => update('siteTitle', v)} placeholder="Mytt �?? Elite Cihazlar" />
        <p className="text-[10px] text-white/25 mt-1">Tarayıcı sekmesi ve Google'da görünür</p>
      </div>

      <div>
        <div className="flex justify-between">
          <Label>Meta Açıklama</Label>
          <span className={`text-[10px] font-bold ${descLen > 160 ? 'text-red-400' : 'text-white/30'}`}>{descLen}/160</span>
        </div>
        <TInput value={draft.siteDesc || ''} onChange={(v) => update('siteDesc', v)} placeholder="Garantili, uzman onaylı yenilenmiş telefonlar..." rows={3} />
      </div>

      <Divider />
      <SectionTitle icon="?��??">Sosyal Medya</SectionTitle>
      <div>
        <Label>Instagram URL</Label>
        <TInput value={draft.instagramUrl || ''} onChange={(v) => update('instagramUrl', v)} placeholder="https://instagram.com/mytt" />
      </div>
      <div>
        <Label>WhatsApp Numarası</Label>
        <TInput value={draft.whatsappNumber || ''} onChange={(v) => update('whatsappNumber', v)} placeholder="+90 555 123 45 67" />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Navbar Tab
// ────────────────────────────────────────────────────────────────────────────

function NavbarTab({ draft, update }: { draft: any; update: (k: string, v: any) => void }) {
  const models = draft.navbarModels || {};
  const modelKeys = Object.keys(models);

  const [newKey, setNewKey] = useState('');

  const addModel = () => {
    if (!newKey) return;
    update('navbarModels', { ...models, [newKey]: '' });
    setNewKey('');
  };

  const removeModel = (key: string) => {
    const updated = { ...models };
    delete updated[key];
    update('navbarModels', updated);
  };

  const updateModelImg = (key: string, url: string) => {
    update('navbarModels', { ...models, [key]: url });
  };

  return (
    <div className="space-y-4 pb-4">
      <SectionTitle icon="🗂️" hint="Menüdeki model kartları için transparan PNG ekleyin.">Navbar Mega Menü Görselleri</SectionTitle>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 flex gap-2">
        <input 
          value={newKey} 
          onChange={e => setNewKey(e.target.value)}
          placeholder="Model Adı (örn: iPhone 16 Pro)"
          className="flex-1 bg-[#0d1020] border border-white/10 rounded-lg px-3 py-2 text-[12px] text-white outline-none focus:border-purple-500/60 transition-all placeholder:text-white/20"
        />
        <button 
          onClick={addModel}
          className="px-4 py-2 bg-purple-600/20 text-purple-400 font-bold text-[12px] rounded-lg border border-purple-500/30 hover:bg-purple-600/40 transition-colors"
        >
          Model Ekle
        </button>
      </div>

      <div className="space-y-3">
        {modelKeys.map((key: string) => (
          <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-white/80">{key}</span>
              <button onClick={() => removeModel(key)} className="text-red-400/60 hover:text-red-400 p-1"><Trash2 size={14}/></button>
            </div>
            <ImgField
              label="Kart Görseli (Şeffaf PNG)"
              value={models[key]}
              onChange={(url) => updateModelImg(key, url)}
              placeholder="Şeffaf arka planlı cihaz görseli"
            />
          </div>
        ))}
        {modelKeys.length === 0 && (
          <div className="text-center py-6 text-white/30 text-[11px]">
            Henüz hiç model görseli eklenmemiş. "iPhone 16 Pro" gibi bir model yazıp ekleyerek başlayın.
          </div>
        )}
      </div>
    </div>
  );
}

// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�
// Main Page
// �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??�
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'theme',    label: 'Tema',     emoji: '🎨' },
  { id: 'header',   label: 'Header',   emoji: '📌' },
  { id: 'navbar',   label: 'Navbar',   emoji: '🗂️' },
  { id: 'homepage', label: 'Anasayfa', emoji: '🏠' },
  { id: 'hero',     label: 'Hero',     emoji: '🖼️' },
  { id: 'bubbles',  label: 'Balonlar', emoji: '💫' },
  { id: 'trustbar', label: 'Güven',    emoji: '🛡️' },
  { id: 'seo',      label: 'SEO',      emoji: '⚙️' },
];

export default function SiteBuilderPage() {
  const { data, isLoading, isError, refetch } = useSiteConfig();
  const updateMutation = useUpdateSiteConfig();

  const [activeTab, setActiveTab] = useState<Tab>('theme');
  const [draft, setDraft] = useState<any>(null);
  const [device, setDevice] = useState<Device>('desktop');
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [editingHeroSlide, setEditingHeroSlide] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Init draft
  useEffect(() => {
    if (data?.settings && !draft) {
      setDraft(JSON.parse(JSON.stringify(data.settings)));
    }
  }, [data]);

  // Fetch hero slides
  useEffect(() => {
    apiClient.get('/hero-slides/admin')
      .then(({ data }) => setHeroSlides(data))
      .catch(() => {});
  }, []);

  // Send postMessage to iframe on draft change (debounced 300ms)
  useEffect(() => {
    if (!draft) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Merge editing slide into heroSlides for live preview
      let previewSlides = [...heroSlides];
      if (editingHeroSlide) {
        if (editingHeroSlide.id) {
          previewSlides = previewSlides.map(s => s.id === editingHeroSlide.id ? editingHeroSlide : s);
        } else {
          // Yeni eklenen slide
          previewSlides = [...previewSlides, { ...editingHeroSlide, id: 'draft-slide' }];
        }
      }

      iframeRef.current?.contentWindow?.postMessage(
        { type: 'BUILDER_PREVIEW', settings: draft, heroSlides: previewSlides },
        window.location.origin,
      );
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [draft, heroSlides, editingHeroSlide]);

  const handleIframeLoad = useCallback(() => {
    if (!draft) return;
    setTimeout(() => {
      let previewSlides = [...heroSlides];
      if (editingHeroSlide) {
        if (editingHeroSlide.id) {
          previewSlides = previewSlides.map(s => s.id === editingHeroSlide.id ? editingHeroSlide : s);
        } else {
          previewSlides = [...previewSlides, { ...editingHeroSlide, id: 'draft-slide' }];
        }
      }
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'BUILDER_PREVIEW', settings: draft, heroSlides: previewSlides },
        window.location.origin,
      );
    }, 200);
  }, [draft, heroSlides, editingHeroSlide]);

  const update = useCallback((key: string, val: any) => {
    setDraft((prev: any) => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await updateMutation.mutateAsync(draft);
      setLastSaved(new Date());
      toast.success('✅ Değişiklikler yayına alındı!');
      // Reload iframe to reflect saved state
      if (iframeRef.current) {
        const src = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 100);
      }
    } catch {
      toast.error('�??� Kayıt başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const reloadIframe = () => {
    if (!iframeRef.current) return;
    const src = iframeRef.current.src;
    iframeRef.current.src = '';
    setTimeout(() => { if (iframeRef.current) iframeRef.current.src = src; }, 100);
  };

  const iframeWidth: Record<Device, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '390px',
  };

  // ── Hata durumu: Backend çalışmıyor veya 5xx ──────────────────────────────
  if (isError) {
    return (
      <div className="-m-4 md:-m-8 flex items-center justify-center" style={{ height: 'calc(100vh - 64px)', background: '#0a0d1a' }}>
        <div className="flex flex-col items-center gap-5 max-w-sm text-center px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#dc2626,#b91c1c)' }}>
            <LayoutTemplate size={26} className="text-white" />
          </div>
          <div>
            <p className="text-white text-[16px] font-bold mb-1">Bağlantı Kurulamadı</p>
            <p className="text-white/40 text-[12px] leading-relaxed">
              Backend sunucusuna ulaşılamıyor. Sunucunun çalıştığından emin olun.
            </p>
            <code className="mt-2 block text-[10px] text-white/25 bg-white/5 rounded-lg px-3 py-2 font-mono">
              cd backend &amp;&amp; npm run start:dev
            </code>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:brightness-110 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
          >
            <RefreshCw size={14} />
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  // ── Yükleniyor durumu ─────────────────────────────────────────────────────
  if (isLoading || !draft) {
    return (
      <div className="-m-4 md:-m-8 flex items-center justify-center" style={{ height: 'calc(100vh - 64px)', background: '#0a0d1a' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <LayoutTemplate size={24} className="text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl animate-ping opacity-20" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }} />
          </div>
          <div className="text-center">
            <p className="text-white/70 text-[14px] font-bold">Visual Builder</p>
            <p className="text-white/30 text-[12px] mt-1">Ayarlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="-m-4 md:-m-8 flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 64px)', background: '#0a0d1a' }}>

      {/* �??��??� Top Bar �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??� */}
      <div className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-white/[0.06]"
        style={{ background: 'linear-gradient(90deg,#0f1117 0%,#12101f 100%)' }}>

        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            <LayoutTemplate size={14} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white leading-none tracking-tight">Visual Builder</p>
            {lastSaved
              ? <p className="text-[9px] text-green-400/60 mt-0.5">✓ {lastSaved.toLocaleTimeString('tr-TR')}'de kaydedildi</p>
              : <p className="text-[9px] text-white/20 mt-0.5">Kayıt yok</p>}
          </div>
        </div>

        {/* Center: Device Toggle */}
        <div className="flex items-center gap-0.5 bg-white/[0.05] border border-white/[0.08] rounded-lg p-0.5">
          {([
            { id: 'desktop' as Device, icon: Monitor, label: 'Masaüstü' },
            { id: 'tablet'  as Device, icon: Tablet,  label: 'Tablet' },
            { id: 'mobile'  as Device, icon: Smartphone, label: 'Mobil' },
          ] as { id: Device; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setDevice(id)}
              title={label}
              className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${device === id ? 'text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}
              style={device === id ? { background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' } : {}}>
              <Icon size={14} />
            </button>
          ))}
        </div>

        {/* Right: URL bar + Reload + Save */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 h-7">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400/80 animate-pulse" />
            <span className="text-[10px] text-white/25 font-mono">localhost:3000</span>
          </div>
          <button
            onClick={reloadIframe}
            className="w-8 h-8 bg-white/[0.04] border border-white/[0.08] rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/20 transition-all"
            title="Yenile">
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 h-8 disabled:opacity-50 text-white text-[12px] font-bold rounded-lg transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Yayınlanıyor...' : 'Yayına Al'}
          </button>
        </div>
      </div>

      {/* �??��??� Body �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??� */}
      <div className="flex flex-1 overflow-hidden">

        {/* �??��??� Left Panel �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??� */}
        <div className="w-[320px] flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden" style={{ background: '#0a0d18' }}>

          {/* Tab Bar */}
          <div className="flex overflow-x-auto border-b border-white/[0.06] px-1.5 pt-1.5 gap-0.5 flex-shrink-0 hide-scrollbar" style={{ background: '#0a0d18' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-2.5 py-2 rounded-t-lg text-[9px] font-bold transition-all flex flex-col items-center gap-0.5 border-b-2 ${activeTab === tab.id ? 'text-purple-300 border-purple-500 bg-gradient-to-b from-purple-500/15 to-purple-500/5' : 'text-white/25 border-transparent hover:text-white/50 hover:bg-white/[0.03]'}`}>
                <span className="text-[15px] leading-none">{tab.emoji}</span>
                <span className="tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'theme'    && <ThemeTab    draft={draft} update={update} />}
            {activeTab === 'header'   && <HeaderTab   draft={draft} update={update} />}
            {activeTab === 'navbar'   && <NavbarTab   draft={draft} update={update} />}
            {activeTab === 'homepage' && <HomepageTab draft={draft} update={update} />}
            {activeTab === 'hero'     && <HeroTab heroSlides={heroSlides} setHeroSlides={setHeroSlides} onEditingChange={setEditingHeroSlide} />}
            {activeTab === 'bubbles'  && <BubblesTab  draft={draft} update={update} />}
            {activeTab === 'trustbar' && <TrustBarTab draft={draft} update={update} />}
            {activeTab === 'seo'      && <SeoTab      draft={draft} update={update} />}
          </div>
        </div>

        {/* �??��??� Right Panel: Live Preview �??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??��??� */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3" style={{ background: 'radial-gradient(ellipse at 50% 0%,#1a1040 0%,#0a0d18 60%)' }}>

          {/* Mini address bar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex-1 h-8 bg-[#0f1117] border border-white/[0.06] rounded-lg flex items-center gap-2 px-3">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center text-[11px] text-white/30">
                ?��?? http://localhost:3000
              </div>
            </div>
          </div>

          {/* iframe container */}
          <div className="flex-1 flex items-start justify-center overflow-auto">
            <div
              className="bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-500 h-full"
              style={{ width: iframeWidth[device], minWidth: 320, height: '100%' }}>
              <iframe
                ref={iframeRef}
                src="http://localhost:3000"
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                title="Canlı Önizleme"
              />
            </div>
          </div>

          {/* Device label */}
          <div className="flex-shrink-0 text-center">
            <span className="text-[10px] text-white/20 font-medium">
              {device === 'desktop' ? '?��� Masaüstü Önizleme' : device === 'tablet' ? '?��� Tablet (768px)' : '?��� Mobil (390px)'}
              {' · Gerçek Zamanlı · Canlı Site'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

