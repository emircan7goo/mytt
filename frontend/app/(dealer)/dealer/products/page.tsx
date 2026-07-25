'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '@/lib/api';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';
import {
  Plus, Trash2, Edit2, Search, X, UploadCloud,
  Loader2, ImageIcon, ChevronDown, Package,
} from 'lucide-react';

// ── Sabitler ──────────────────────────────────────────────────────────────────

const GRADES = [
  { value: 'A+', label: 'A+ Kalite', desc: 'Tertemiz — Hiç iz yok, neredeyse sıfır', color: '#F97316' },
  { value: 'A',  label: 'A Kalite',  desc: 'Çok İyi — Gözle zor fark edilen kılcal iz', color: '#38bdf8' },
  { value: 'B',  label: 'B Kalite',  desc: 'İyi — Belirgin kullanım izi var, tam çalışır', color: '#f59e0b' },
  { value: 'C',  label: 'C Kalite',  desc: 'Kasa çizik/ezik — Tamirsiz, eksiksiz çalışır', color: '#f87171' },
];

const gradeInfo = (g: string) => GRADES.find(x => x.value === g) ?? GRADES[2];

const EMPTY_FORM = {
  id: '',
  globalProductId: '',
  price: '',
  stock: 1,
  grade: 'A',
  batteryHealth: '',
  hasBox: false,
  hasInvoice: false,
  hasAccessories: false,
  warrantyMonths: 12,
  imei: '',
  notes: '',
  dealerImages: [] as string[],
};

// ── Dark Input Stili ──────────────────────────────────────────────────────────

const darkInput: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  color: '#f8fafc',
  fontSize: 13,
  padding: '10px 14px',
  outline: 'none',
  boxSizing: 'border-box',
};

const darkLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  color: 'rgba(248,250,252,0.45)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 6,
};

const darkCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
};

// ── Görsel Yükleme Komponenti ─────────────────────────────────────────────────

function ImageUploadSlot({
  value, index, onUpload, onRemove,
}: {
  value: string; index: number;
  onUpload: (url: string) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await apiClient.post('/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data?.url) { onUpload(data.url); toast.success(`Fotoğraf ${index + 1} yüklendi`); }
      else toast.error('Sunucu URL döndürmedi');
    } catch { toast.error('Yükleme başarısız'); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };

  return (
    <div>
      <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(248,250,252,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
        Fotoğraf {index + 1}{index < 3 ? ' *' : ''}
      </span>
      {value ? (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} className="group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveUploadUrl(value)} alt={`Fotoğraf ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button" onClick={onRemove}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          style={{ width: '100%', aspectRatio: '4/3', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: busy ? 'wait' : 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
        >
          {busy
            ? <Loader2 size={20} color="rgba(248,250,252,0.4)" style={{ animation: 'spin 1s linear infinite' }} />
            : <><UploadCloud size={20} color="rgba(248,250,252,0.35)" /><span style={{ fontSize: 11, color: 'rgba(248,250,252,0.35)', fontWeight: 600 }}>Yükle</span></>
          }
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ── Arama Yapılabilir Model Seçici ────────────────────────────────────────────

function CatalogCombobox({
  catalogs, value, onChange, disabled,
}: {
  catalogs: any[]; value: string;
  onChange: (id: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = catalogs.find(c => c.id === value);

  const filtered = search.trim()
    ? catalogs.filter(c => `${c.brand} ${c.model} ${c.storage ?? ''} ${c.color ?? ''}`.toLowerCase().includes(search.toLowerCase()))
    : catalogs;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (id: string) => { onChange(id); setSearch(''); setOpen(false); };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button" disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10, color: selected ? '#f8fafc' : 'rgba(248,250,252,0.35)',
          fontSize: 13, fontWeight: selected ? 600 : 400, padding: '10px 14px',
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>
          {selected
            ? `${selected.brand} ${selected.model} — ${selected.storage ?? ''} ${selected.color ?? ''}`
            : 'Model seçin veya arayın...'}
        </span>
        <ChevronDown size={15} color="rgba(248,250,252,0.4)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', zIndex: 9999, top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#111827', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}>
          {/* Arama */}
          <div style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '7px 12px' }}>
              <Search size={13} color="rgba(248,250,252,0.35)" />
              <input
                autoFocus type="text"
                placeholder='Örn: "iph", "samsung s24", "256"...'
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: 13 }}
              />
              {search && <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(248,250,252,0.4)', display: 'flex' }}><X size={12} /></button>}
            </div>
          </div>

          {/* Liste */}
          <div style={{ maxHeight: 256, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <p style={{ padding: '16px', textAlign: 'center', color: 'rgba(248,250,252,0.3)', fontSize: 13 }}>Sonuç yok</p>
              : filtered.map(c => (
                <button
                  key={c.id} type="button" onClick={() => select(c.id)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '9px 16px', border: 'none',
                    background: c.id === value ? 'rgba(56,189,248,0.1)' : 'transparent',
                    color: c.id === value ? '#38bdf8' : 'rgba(248,250,252,0.75)',
                    fontSize: 13, fontWeight: c.id === value ? 700 : 400, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (c.id !== value) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (c.id !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Package size={12} color="rgba(248,250,252,0.25)" />
                  <span>
                    <strong>{c.brand}</strong>{' '}{c.model}
                    {c.storage && <span style={{ color: 'rgba(248,250,252,0.45)' }}> — {c.storage}</span>}
                    {c.color && <span style={{ color: 'rgba(248,250,252,0.3)' }}> {c.color}</span>}
                  </span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Grade Rozeti ──────────────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: string }) {
  const info = gradeInfo(grade);
  return (
    <span style={{
      background: `${info.color}18`, color: info.color,
      border: `1px solid ${info.color}40`,
      borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 800,
      display: 'inline-block',
    }}>
      {info.label}
    </span>
  );
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────

export default function DealerStockPage() {
  const [stocks,   setStocks]   = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });

  useEffect(() => { fetchData(); }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [stockRes, catRes] = await Promise.all([
        apiClient.get('/catalog/stock/my').catch(() => ({ data: [] })),
        apiClient.get('/catalog').catch(() => ({ data: [] })),
      ]);
      setStocks(Array.isArray(stockRes.data) ? stockRes.data : []);
      setCatalogs(Array.isArray(catRes.data) ? catRes.data : []);
    } catch { toast.error('Veriler alınamadı'); }
    finally { setIsLoading(false); }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.globalProductId) return toast.error('Lütfen bir model seçin');
    if (!form.id && form.dealerImages.filter(Boolean).length < 3)
      return toast.error('Cihazın elinizde olduğunu kanıtlamak için en az 3 fotoğraf yükleyin');

    setIsSaving(true);
    // id asla payload'a girmesin — forbidNonWhitelisted: true backend'de reddeder
    const payload: Record<string, unknown> = {
      globalProductId: form.globalProductId,
      grade:           form.grade,
      price:           String(form.price),
      stock:           Number(form.stock),
      hasBox:          form.hasBox,
      hasInvoice:      form.hasInvoice,
      hasAccessories:  form.hasAccessories,
      dealerImages:    form.dealerImages.filter(Boolean),
      ...(form.batteryHealth  && { batteryHealth:  Number(form.batteryHealth) }),
      ...(form.warrantyMonths && { warrantyMonths: Number(form.warrantyMonths) }),
      ...(form.imei           && { imei:           form.imei }),
      ...(form.notes          && { notes:          form.notes }),
    };

    try {
      if (form.id) {
        await apiClient.patch(`/catalog/stock/${form.id}`, payload);
        toast.success('Stok güncellendi');
      } else {
        await apiClient.post('/catalog/stock', payload);
        toast.success('Stok başarıyla eklendi!');
      }
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      const d = err?.response?.data;
      // AllExceptionsFilter returns { error: HttpException.getResponse() }
      // HttpException.getResponse() is { statusCode, message, error } or a plain string
      const inner = d?.error;
      const msg = d?.message
        ?? (typeof inner === 'string' ? inner : (inner?.message ?? null));
      const final = Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : null);
      toast.error(final ?? 'Kaydedilirken hata oluştu');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu stok kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await apiClient.delete(`/catalog/stock/${id}`);
      toast.success('Stok silindi');
      fetchData();
    } catch { toast.error('Silinirken hata oluştu'); }
  };

  const openEdit = (stock: any) => {
    setForm({
      id: stock.id,
      globalProductId: stock.globalProductId,
      price: Number(stock.price).toString(),
      stock: stock.stock,
      grade: stock.grade,
      batteryHealth: stock.batteryHealth ?? '',
      hasBox: stock.hasBox,
      hasInvoice: stock.hasInvoice,
      hasAccessories: stock.hasAccessories,
      warrantyMonths: stock.warrantyMonths ?? 12,
      imei: stock.imei ?? '',
      notes: stock.notes ?? '',
      dealerImages: stock.dealerImages ?? [],
    });
    setIsEditing(true);
  };

  const openNew = () => { setForm({ ...EMPTY_FORM }); setIsEditing(true); };

  const updateImage = (i: number, url: string) =>
    setForm(prev => { const imgs = [...prev.dealerImages]; imgs[i] = url; return { ...prev, dealerImages: imgs }; });

  const removeImage = (i: number) =>
    setForm(prev => { const imgs = [...prev.dealerImages]; imgs.splice(i, 1); return { ...prev, dealerImages: imgs }; });

  const imageSlots = [...form.dealerImages];
  while (imageSlots.length < 4) imageSlots.push('');

  const uploadedCount = form.dealerImages.filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Başlık */}
      <div style={{ ...darkCard, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: 20, fontWeight: 800, margin: 0 }}>Stok Yönetimi</h1>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 13, marginTop: 4 }}>
            Platformdaki elinizdeki cihazları ekleyip yönetin.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={openNew}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px',
              background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
              color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.3)',
            }}
          >
            <Plus size={15} /> Yeni Cihaz Ekle
          </button>
        )}
      </div>

      {/* Form */}
      {isEditing && (
        <div style={{ ...darkCard, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 800, margin: 0 }}>
              {form.id ? 'Kaydı Düzenle' : 'Yeni Stok Ekle'}
            </h2>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'rgba(248,250,252,0.4)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              İptal
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Model Seçimi */}
            <div>
              <label style={darkLabel}>Model (Katalogdan Seçin) *</label>
              <CatalogCombobox catalogs={catalogs} value={form.globalProductId} onChange={id => setForm(f => ({ ...f, globalProductId: id }))} disabled={!!form.id} />
              {!form.globalProductId && (
                <p style={{ color: 'rgba(248,250,252,0.25)', fontSize: 11, marginTop: 5 }}>
                  Arama kutusuna marka/model yazarak filtreleyin — &quot;iph&quot;, &quot;samsung s24&quot;, &quot;256&quot;...
                </p>
              )}
            </div>

            {/* Fotoğraf Yükleme */}
            <div style={{ ...darkCard, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, margin: 0 }}>
                    Cihaz Fotoğrafları
                    <span style={{ color: 'rgba(248,250,252,0.4)', fontWeight: 400 }}> (Min. 3 Zorunlu)</span>
                  </p>
                  <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 11, marginTop: 3 }}>
                    Cihazın gerçekten elinizde olduğunu kanıtlamanız gerekiyor.{' '}
                    <span style={{ fontWeight: 700, color: uploadedCount >= 3 ? '#F97316' : '#f87171' }}>
                      {uploadedCount}/3 yüklendi
                    </span>
                  </p>
                </div>
                {imageSlots.length < 8 && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, dealerImages: [...f.dealerImages, ''] }))}
                    style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(248,250,252,0.5)', fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={12} /> Slot
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {imageSlots.map((url, i) => (
                  <ImageUploadSlot key={i} index={i} value={url} onUpload={u => updateImage(i, u)} onRemove={() => removeImage(i)} />
                ))}
              </div>
            </div>

            {/* Grade + Fiyat/Pil/Stok yan yana */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Grade */}
              <div>
                <label style={darkLabel}>Cihaz Kalitesi *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {GRADES.map(g => (
                    <button
                      key={g.value} type="button"
                      onClick={() => setForm(f => ({ ...f, grade: g.value }))}
                      style={{
                        border: `2px solid ${form.grade === g.value ? g.color : 'rgba(255,255,255,0.1)'}`,
                        background: form.grade === g.value ? `${g.color}12` : 'rgba(255,255,255,0.03)',
                        borderRadius: 10, padding: 10, textAlign: 'left', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ color: g.color, fontSize: 11, fontWeight: 800, marginBottom: 2 }}>{g.label}</div>
                      <div style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, lineHeight: 1.3 }}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fiyat / Pil / Stok */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={darkLabel}>Satış Fiyatı (₺) *</label>
                  <input
                    type="number" required min="1" step="1"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="Örn: 24500"
                    style={darkInput}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
                <div>
                  <label style={darkLabel}>Pil Sağlığı (%)</label>
                  <input
                    type="number" min="50" max="100"
                    value={form.batteryHealth} onChange={e => setForm(f => ({ ...f, batteryHealth: e.target.value }))}
                    placeholder="Örn: 88" style={darkInput}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
                <div>
                  <label style={darkLabel}>Stok Miktarı *</label>
                  <input
                    type="number" required min="1"
                    value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                    style={darkInput}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(14,165,233,0.5)'; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>
              </div>
            </div>

            {/* IMEI + Garanti */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={darkLabel}>IMEI <span style={{ color: 'rgba(248,250,252,0.25)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(gizli, sadece admin)</span></label>
                <input
                  type="text" value={form.imei} onChange={e => setForm(f => ({ ...f, imei: e.target.value }))}
                  placeholder="Alıcılara gösterilmez" style={darkInput}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(14,165,233,0.5)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
              <div>
                <label style={darkLabel}>Garanti Süresi (Ay)</label>
                <input
                  type="number" min="0" value={form.warrantyMonths}
                  onChange={e => setForm(f => ({ ...f, warrantyMonths: Number(e.target.value) }))}
                  style={darkInput}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(14,165,233,0.5)'; }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
            </div>

            {/* Ekstralar */}
            <div>
              <label style={darkLabel}>Cihaz İle Birlikte Gelenler</label>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { key: 'hasBox', label: 'Orijinal Kutu' },
                  { key: 'hasInvoice', label: 'Fatura' },
                  { key: 'hasAccessories', label: 'Aksesuarlar' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <div
                      onClick={() => setForm(f => ({ ...f, [key]: !(f as any)[key] }))}
                      style={{
                        width: 18, height: 18, borderRadius: 5,
                        border: `2px solid ${(form as any)[key] ? '#38bdf8' : 'rgba(255,255,255,0.2)'}`,
                        background: (form as any)[key] ? 'rgba(56,189,248,0.2)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {(form as any)[key] && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ color: 'rgba(248,250,252,0.7)', fontSize: 13, fontWeight: 500 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notlar */}
            <div>
              <label style={darkLabel}>İlan Notu</label>
              <textarea
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3} placeholder="Cihaz hakkında alıcıya iletmek istediğiniz notlar..."
                style={{ ...darkInput, resize: 'none', fontFamily: 'inherit' }}
                onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(14,165,233,0.5)'; }}
                onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            {/* Kaydet */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
              <button type="button" onClick={() => setIsEditing(false)}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(248,250,252,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Vazgeç
              </button>
              <button type="submit" disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 28px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
                {isSaving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {form.id ? 'Güncelle' : 'Stoku Kaydet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tablo */}
      {!isEditing && (
        <div style={{ ...darkCard, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                {['Fotoğraf', 'Model & Detay', 'Kalite', 'Stok', 'Fiyat', 'İşlem'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', color: 'rgba(248,250,252,0.3)', fontWeight: 700, textAlign: 'left', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                  <Loader2 size={26} color="rgba(248,250,252,0.3)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                </td></tr>
              ) : stocks.length > 0 ? (
                stocks.map(s => {
                  const firstImg = s.dealerImages?.[0];
                  const price = Number(s.price).toLocaleString('tr-TR');
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 14px', width: 56 }}>
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveUploadUrl(firstImg)} alt="cihaz" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon size={18} color="rgba(255,255,255,0.2)" />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ color: '#f8fafc', fontWeight: 700 }}>
                          {s.globalProduct?.brand} {s.globalProduct?.model}
                        </div>
                        <div style={{ color: 'rgba(248,250,252,0.4)', fontSize: 11, marginTop: 2 }}>
                          {s.globalProduct?.storage}
                          {s.batteryHealth ? ` · Pil %${s.batteryHealth}` : ''}
                          {s.hasBox ? ' · Kutulu' : ''}
                        </div>
                        {(s.dealerImages?.filter(Boolean).length ?? 0) > 0 && (
                          <div style={{ color: '#38bdf8', fontSize: 10, fontWeight: 600, marginTop: 2 }}>
                            {s.dealerImages.filter(Boolean).length} fotoğraf
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px' }}><GradeBadge grade={s.grade} /></td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ color: '#f8fafc', fontWeight: 700 }}>{s.stock}</span>
                        <span style={{ color: 'rgba(248,250,252,0.35)', fontSize: 11 }}> adet</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#f8fafc', fontWeight: 900 }}>{price} ₺</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button onClick={() => openEdit(s)}
                            style={{ padding: 7, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(248,250,252,0.7)', cursor: 'pointer', display: 'flex' }}
                            title="Düzenle"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(s.id)}
                            style={{ padding: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', cursor: 'pointer', display: 'flex' }}
                            title="Sil"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Package size={38} color="rgba(248,250,252,0.15)" />
                    <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 13, margin: 0 }}>Henüz stok cihazınız bulunmuyor</p>
                    <button onClick={openNew}
                      style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: 12, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                      İlk cihazı ekle
                    </button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
