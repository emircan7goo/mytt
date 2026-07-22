'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import {
  Plus, Trash2, Edit2, Search, Package,
  UploadCloud, Loader2, X, ChevronLeft, ChevronRight,
  Image as ImageIcon, ArrowLeft, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, Cpu, Battery, Wifi, Camera,
  MonitorSmartphone, Zap, RefreshCw,
} from 'lucide-react';
import apiClient from '@/lib/api';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';

// ── Sabitler ──────────────────────────────────────────────────────────────────
const BRANDS = [
  'Apple', 'Samsung', 'Xiaomi', 'POCO',
  'Huawei', 'Vivo', 'Tecno', 'Infinix', 'Realme',
];

const SPEC_FIELDS = [
  { key: 'ram',          label: 'RAM',       icon: Cpu },
  { key: 'chipset',      label: 'İşlemci',   icon: Cpu },
  { key: 'display',      label: 'Ekran',     icon: MonitorSmartphone },
  { key: 'camera',       label: 'Kamera',    icon: Camera },
  { key: 'battery',      label: 'Batarya',   icon: Battery },
  { key: 'charging',     label: 'Şarj',      icon: Zap },
  { key: 'connectivity', label: 'Bağlantı',  icon: Wifi },
];

const PAGE_SIZE = 30;

// ── Tamamlanma skoru ──────────────────────────────────────────────────────────
function completeness(variants: any[]) {
  const p = variants[0];
  const specs = p?.specsJson ?? {};
  const filled = SPEC_FIELDS.filter(f => (specs as any)[f.key]).length;
  const hasImg  = !!(p?.masterImages?.[0]);
  if (filled >= 5 && hasImg)  return 'full';
  if (filled >= 2 || hasImg)  return 'partial';
  return 'empty';
}

function CompletenessDot({ level }: { level: string }) {
  const map: Record<string, { bg: string; title: string }> = {
    full:    { bg: '#10b981', title: 'Specs + görsel tam' },
    partial: { bg: '#f59e0b', title: 'Kısmi bilgi' },
    empty:   { bg: '#ef4444', title: 'Specs/görsel eksik' },
  };
  const { bg, title } = map[level] ?? map.empty;
  return (
    <span
      title={title}
      style={{ width: 9, height: 9, borderRadius: '50%', background: bg,
        boxShadow: `0 0 6px ${bg}99`, display: 'inline-block', flexShrink: 0 }}
    />
  );
}

// ── Görsel Yükleme Alanı ──────────────────────────────────────────────────────
function ImgUpload({ value, onChange, index }: { value: string; onChange: (v: string) => void; index: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await apiClient.post('/uploads/image', fd);
      if (data?.url) { onChange(data.url); toast.success('Görsel yüklendi'); }
      else toast.error('Sunucu URL döndürmedi');
    } catch { toast.error('Yükleme başarısız'); }
    finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  };
  return (
    <div>
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Görsel {index + 1}</label>
      <div className="flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-zinc-200 placeholder-zinc-600 text-xs focus:outline-none focus:border-sky-500/50 transition-colors min-w-0"
          placeholder="URL veya aşağıdan yükle" />
        <input type="file" accept="image/*" ref={ref} onChange={upload} className="hidden" />
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="px-3 py-2 bg-sky-500/10 border border-sky-500/25 rounded-lg text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center gap-1.5 text-xs font-bold disabled:opacity-50 flex-shrink-0">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
          {busy ? '...' : 'Yükle'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="px-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0">
            <X size={12} />
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.07] flex items-center justify-center h-24">
          <img src={resolveUploadUrl(value)} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}

const iCls = 'w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors';
const lCls = 'block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wide';

// ── Spec Chip ─────────────────────────────────────────────────────────────────
function SpecChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
      <Icon size={11} className="text-zinc-500 flex-shrink-0" />
      <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-zinc-300 text-[11px] ml-1">{value}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ANA SAYFA
// ═════════════════════════════════════════════════════════════════════════════
export default function AdminCatalogPage() {
  const [products, setProducts]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [page, setPage]           = useState(1);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [editing, setEditing]     = useState<any | null>(null);
  const [saving, setSaving]       = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/catalog');
      setProducts(res.data);
    } catch { toast.error('Katalog yüklenemedi'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Grupla ───────────────────────────────────────────────────────────────────
  const groups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const p of products) {
      const key = `${p.brand}||${p.model}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries()).map(([key, variants]) => ({
      key,
      brand:   variants[0].brand,
      model:   variants[0].model,
      variants,
      storages: Array.from(new Set(variants.map((v: any) => v.storage).filter(Boolean))).sort(),
      level:   completeness(variants),
    }));
  }, [products]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    brands:    new Set(products.map(p => p.brand)).size,
    models:    groups.length,
    variants:  products.length,
    withSpecs: groups.filter(g => g.level !== 'empty').length,
    withImg:   groups.filter(g => !!(g.variants[0]?.masterImages?.[0])).length,
  }), [products, groups]);

  // ── Filtrele + sayfalama ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = groups;
    if (brandFilter) list = list.filter(g => g.brand === brandFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(g =>
        g.brand.toLowerCase().includes(q) ||
        g.model.toLowerCase().includes(q),
      );
    }
    return list;
  }, [groups, search, brandFilter]);

  useEffect(() => { setPage(1); }, [search, brandFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Edit helpers ──────────────────────────────────────────────────────────────
  const startCreate = () => setEditing({
    brand: 'Apple', model: '', storage: '', color: '',
    isActive: true, masterImages: ['', '', ''],
    specsJson: {}, applyToAll: false,
  });

  const startEdit = (group: any) => {
    const p = group.variants[0];
    setEditing({
      ...p,
      masterImages: p.masterImages?.length ? [...p.masterImages, '', ''].slice(0, 3) : ['', '', ''],
      specsJson: p.specsJson ?? {},
      applyToAll: true,
      _variantCount: group.variants.length,
      _allVariants: group.variants,
    });
  };

  const setSpec = (key: string, val: string) =>
    setEditing((e: any) => ({ ...e, specsJson: { ...e.specsJson, [key]: val } }));

  const setImg = (i: number, val: string) =>
    setEditing((e: any) => {
      const imgs = [...(e.masterImages ?? ['', '', ''])];
      imgs[i] = val;
      return { ...e, masterImages: imgs };
    });

  // ── Kaydet ───────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const basePayload = {
      brand:        editing.brand,
      model:        editing.model,
      isActive:     editing.isActive,
      masterImages: (editing.masterImages as string[]).filter(Boolean),
      specsJson:    editing.specsJson,
    };
    try {
      if (!editing.id) {
        // Yeni ürün
        await apiClient.post('/catalog', {
          ...basePayload,
          storage: editing.storage || null,
          color:   editing.color   || null,
        });
        toast.success('Ürün kataloğa eklendi');
      } else if (editing.applyToAll && editing._allVariants?.length > 1) {
        // Tüm varyantlara uygula
        await Promise.all(
          editing._allVariants.map((v: any) =>
            apiClient.patch(`/catalog/${v.id}`, {
              ...basePayload,
              storage: v.storage,
              color:   v.color,
            }),
          ),
        );
        toast.success(`${editing._allVariants.length} varyant güncellendi`);
      } else {
        await apiClient.patch(`/catalog/${editing.id}`, {
          ...basePayload,
          storage: editing.storage || null,
          color:   editing.color   || null,
        });
        toast.success('Ürün güncellendi');
      }
      setEditing(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Kaydedilirken hata oluştu');
    } finally { setSaving(false); }
  };

  // ── Sil (grubun tümünü) ───────────────────────────────────────────────────────
  const handleDelete = async (group: any) => {
    const n = group.variants.length;
    if (!confirm(`"${group.brand} ${group.model}" — ${n} varyantın tümü silinsin mi?`)) return;
    try {
      await Promise.all(group.variants.map((v: any) => apiClient.delete(`/catalog/${v.id}`)));
      toast.success(`${n} kayıt silindi`);
      fetchProducts();
    } catch { toast.error('Silinemedi'); }
  };

  // ── Aktif/Pasif tüm varyanttlar ───────────────────────────────────────────────
  const toggleGroup = async (group: any) => {
    const anyActive = group.variants.some((v: any) => v.isActive);
    const newVal = !anyActive;
    try {
      await Promise.all(
        group.variants.map((v: any) => apiClient.patch(`/catalog/${v.id}`, { isActive: newVal })),
      );
      setProducts(prev =>
        prev.map(p =>
          p.brand === group.brand && p.model === group.model ? { ...p, isActive: newVal } : p,
        ),
      );
    } catch { toast.error('Durum değiştirilemedi'); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // EDIT VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  if (editing !== null) {
    const varCount = editing._variantCount ?? 1;
    return (
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setEditing(null)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {editing.id ? `${editing.brand} ${editing.model} — Düzenle` : 'Yeni Model Ekle'}
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {editing.id ? `${varCount} depolama varyantı` : 'Tek varyant ekleniyor'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Temel Bilgiler */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-zinc-300 font-bold text-sm mb-4 flex items-center gap-2">
              <Package size={15} className="text-sky-400" /> Temel Bilgiler
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lCls}>Marka</label>
                <select value={editing.brand} onChange={e => setEditing({ ...editing, brand: e.target.value })} className={iCls}>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div>
                <label className={lCls}>Model Adı *</label>
                <input required value={editing.model} onChange={e => setEditing({ ...editing, model: e.target.value })} className={iCls} placeholder="Örn: iPhone 16 Pro" />
              </div>
              {!editing.id && (
                <>
                  <div>
                    <label className={lCls}>Depolama</label>
                    <input value={editing.storage ?? ''} onChange={e => setEditing({ ...editing, storage: e.target.value })} className={iCls} placeholder="256GB" />
                  </div>
                  <div>
                    <label className={lCls}>Renk (opsiyonel)</label>
                    <input value={editing.color ?? ''} onChange={e => setEditing({ ...editing, color: e.target.value })} className={iCls} placeholder="Uzay Siyahı" />
                  </div>
                </>
              )}
            </div>

            {/* Aktif toggle */}
            <div className="mt-4 flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div>
                <p className="text-zinc-200 text-sm font-semibold">Aktif</p>
                <p className="text-zinc-500 text-xs">Pasif modeller bayilere gösterilmez</p>
              </div>
              <button type="button" onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}>
                {editing.isActive
                  ? <ToggleRight size={28} className="text-emerald-400" />
                  : <ToggleLeft  size={28} className="text-zinc-400" />}
              </button>
            </div>
          </div>

          {/* Görseller */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-zinc-300 font-bold text-sm mb-4 flex items-center gap-2">
              <ImageIcon size={15} className="text-purple-400" /> Ürün Görselleri (maks 3)
            </h3>
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map(i => (
                <ImgUpload key={i} index={i}
                  value={(editing.masterImages ?? ['', '', ''])[i] ?? ''}
                  onChange={v => setImg(i, v)} />
              ))}
            </div>
          </div>

          {/* Teknik Özellikler */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-zinc-300 font-bold text-sm mb-4">📋 Teknik Özellikler</h3>
            <div className="grid grid-cols-2 gap-4">
              {SPEC_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className={lCls}>{label}</label>
                  <input
                    value={(editing.specsJson ?? {})[key] ?? ''}
                    onChange={e => setSpec(key, e.target.value)}
                    className={iCls}
                    placeholder={`${label} girin`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tüm varyantlara uygula */}
          {editing.id && varCount > 1 && (
            <div
              onClick={() => setEditing((e: any) => ({ ...e, applyToAll: !e.applyToAll }))}
              className={editing.applyToAll ? 'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all bg-violet-500/10 border-violet-500/30' : 'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15]'}
            >
              <div className={editing.applyToAll ? 'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border bg-violet-500 border-violet-500' : 'w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border border-white/[0.2]'}>
                {editing.applyToAll && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <div>
                <p className={`text-sm font-semibold ${editing.applyToAll ? 'text-violet-300' : 'text-zinc-300'}`}>
                  Tüm varyantlara uygula
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Specs ve görseller <strong className="text-zinc-400">{varCount} depolama varyantına</strong> uygulanır
                  ({editing._allVariants?.map((v: any) => v.storage).join(', ')})
                </p>
              </div>
            </div>
          )}

          {/* Kaydet */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30 font-bold text-sm rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Kaydediliyor…</> : 'Kaydet'}
            </button>
            <button type="button" onClick={() => setEditing(null)}
              className="px-8 py-3 bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 font-bold text-sm rounded-xl transition-colors">
              Vazgeç
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats Bar ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Marka',   value: stats.brands,    color: '#a855f7' },
          { label: 'Model',   value: stats.models,    color: '#3b82f6' },
          { label: 'Varyant', value: stats.variants,  color: '#64748b' },
          { label: 'Specs Dolu', value: stats.withSpecs, color: '#10b981' },
          { label: 'Görselli',   value: stats.withImg,   color: '#f59e0b' },
        ].map(s => (
          <div key={s.label}
            className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-zinc-500 text-xs font-medium">{s.label}</span>
            <span className="text-lg font-bold" style={{ color: s.color }}>{isLoading ? '…' : s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center bg-white/[0.03] border border-white/[0.08] p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Global Katalog</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isLoading ? 'Yükleniyor…' : `${filtered.length} model grubu · sayfa ${page}/${totalPages || 1}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-40">
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={startCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 font-bold text-sm rounded-xl transition-colors">
            <Plus size={16} /> Yeni Model
          </button>
        </div>
      </div>

      {/* ── Filtre ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Model ara…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-zinc-200 placeholder-zinc-600 text-sm focus:outline-none focus:border-sky-500/40 transition-colors" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setBrandFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 border transition-colors ${!brandFilter ? 'bg-sky-500/15 border-sky-500/30 text-sky-400' : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300'}`}>
            Tümü
          </button>
          {BRANDS.map(b => (
            <button key={b} onClick={() => setBrandFilter(b === brandFilter ? '' : b)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 border transition-colors ${brandFilter === b ? 'bg-sky-500/15 border-sky-500/30 text-sky-400' : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tablo ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
              <th className="px-4 py-3 text-left text-zinc-500 text-[11px] font-bold uppercase tracking-wider w-12">Görsel</th>
              <th className="px-4 py-3 text-left text-zinc-500 text-[11px] font-bold uppercase tracking-wider">Model</th>
              <th className="px-4 py-3 text-left text-zinc-500 text-[11px] font-bold uppercase tracking-wider hidden md:table-cell">Varyantlar</th>
              <th className="px-4 py-3 text-left text-zinc-500 text-[11px] font-bold uppercase tracking-wider hidden lg:table-cell">Durum</th>
              <th className="px-4 py-3 text-right text-zinc-500 text-[11px] font-bold uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-zinc-500">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2 text-zinc-400" />
                  Katalog yükleniyor…
                </td>
              </tr>
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center text-zinc-400">
                  {search || brandFilter ? 'Arama sonucu bulunamadı.' : 'Katalog boş — "Yeni Model" ile başlayın.'}
                </td>
              </tr>
            ) : pageItems.map(group => {
              const primary = group.variants[0];
              const thumb   = primary?.masterImages?.[0];
              const specs   = primary?.specsJson ?? {};
              const isOpen  = expandedKey === group.key;
              const anyActive = group.variants.some((v: any) => v.isActive);

              return (
                <Fragment key={group.key}>
                  {/* Ana Satır */}
                  <tr
                    className="border-b border-white/[0.04] transition-colors cursor-pointer"
                    style={{ background: isOpen ? 'rgba(255,255,255,0.025)' : undefined }}
                    onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                    onClick={() => setExpandedKey(isOpen ? null : group.key)}
                  >
                    {/* Thumbnail */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center overflow-hidden">
                        {thumb
                          ? <img src={resolveUploadUrl(thumb)} alt="" className="w-full h-full object-contain" />
                          : <ImageIcon size={14} className="text-zinc-400" />}
                      </div>
                    </td>

                    {/* Model adı + completeness */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompletenessDot level={group.level} />
                        <div>
                          <p className="text-zinc-100 font-semibold text-[13px]">{group.brand} {group.model}</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5">
                            {group.variants.length} varyant
                            {group.level === 'full' && <span className="text-emerald-500/70 ml-2">● Tam</span>}
                            {group.level === 'partial' && <span className="text-amber-500/70 ml-2">● Kısmi</span>}
                            {group.level === 'empty' && <span className="text-red-500/70 ml-2">● Eksik</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Depolama chips */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {group.storages.map((s: string, index: number) => (
                          <span key={`${group.key}-storage-${index}`} className="px-2 py-0.5 bg-white/[0.06] text-zinc-400 text-[10px] font-medium rounded-md border border-white/[0.08]">{s}</span>
                        ))}
                        {group.storages.length === 0 && <span className="text-zinc-400 text-xs">—</span>}
                      </div>
                    </td>

                    {/* Aktif/Pasif */}
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleGroup(group)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${anyActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-zinc-400 hover:text-zinc-400'}`}>
                        {anyActive
                          ? <ToggleRight size={16} className="text-emerald-400" />
                          : <ToggleLeft  size={16} className="text-zinc-400" />}
                        {anyActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>

                    {/* İşlemler */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2 justify-end items-center">
                        <button onClick={() => setExpandedKey(isOpen ? null : group.key)}
                          className="p-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
                          title="Specs önizle">
                          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                        <button onClick={() => startEdit(group)}
                          className="p-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-zinc-100 rounded-lg transition-colors"
                          title="Düzenle">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(group)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="Sil">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Genişletilmiş Spec Satırı */}
                  {isOpen && (
                    <tr key={`${group.key}-expanded`} className="border-b border-white/[0.04]">
                      <td colSpan={5} className="px-4 py-3 bg-white/[0.015]">
                        <div className="flex flex-wrap gap-2">
                          {SPEC_FIELDS.map(({ key, label, icon }) => {
                            const val = (specs as any)[key];
                            return val ? (
                              <SpecChip key={key} icon={icon} label={label} value={val} />
                            ) : null;
                          })}
                          {SPEC_FIELDS.every(f => !(specs as any)[f.key]) && (
                            <span className="text-zinc-400 text-xs italic">
                              Henüz teknik özellik girilmemiş — Düzenle ile ekleyin.
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            <span className="text-zinc-500 text-xs">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} grup
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={15} />
              </button>
              <span className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.07] rounded-lg text-zinc-400 text-xs font-bold">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
