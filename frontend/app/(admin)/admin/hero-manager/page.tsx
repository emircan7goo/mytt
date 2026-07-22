'use client';
import { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, Plus, Image as ImageIcon, Save, X, Upload, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { API_BASE } from '@/lib/api';

const EMPTY_SLIDE = {
  imageUrl: '',
  title: '',
  subtitle: '',
  btnLeftText: '',
  btnLeftLink: '',
  btnRightText: '',
  btnRightLink: '',
  overlayOpacity: 30,
  textColor: '#ffffff',
  textAlignment: 'left',
  order: 0,
  isActive: true,
};

export default function HeroManagerPage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = async () => {
    try {
      const { data } = await apiClient.get('/hero-slides/admin');
      setSlides(data);
    } catch {
      toast.error('Slide verileri alınamadı');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Görsel Yükleme ─────────────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const url = json?.url ?? json?.path ?? '';
      if (!url) throw new Error('URL dönmedi');
      setEditingSlide((prev: any) => ({ ...prev, imageUrl: url }));
      toast.success('Görsel yüklendi ✓');
    } catch (err: any) {
      toast.error(`Yükleme hatası: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ── Kaydet ─────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide.imageUrl?.trim()) {
      toast.error('Lütfen bir görsel yükleyin veya URL girin');
      return;
    }
    try {
      if (editingSlide.id) {
        await apiClient.patch(`/hero-slides/${editingSlide.id}`, editingSlide);
        toast.success('Slide güncellendi ✓');
      } else {
        await apiClient.post('/hero-slides', { ...editingSlide, isActive: true });
        toast.success('Yeni slide eklendi ✓');
      }
      setIsEditing(false);
      fetchSlides();
    } catch {
      toast.error('Kaydedilirken hata oluştu');
    }
  };

  // ── Aktif / Pasif toggle ────────────────────────────────────────────────────
  const handleToggleActive = async (slide: any) => {
    try {
      await apiClient.patch(`/hero-slides/${slide.id}`, { isActive: !slide.isActive });
      toast.success(slide.isActive ? 'Slide gizlendi' : 'Slide aktif edildi ✓');
      fetchSlides();
    } catch {
      toast.error('Güncelleme hatası');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu slide\'ı silmek istiyor musunuz?')) return;
    try {
      await apiClient.delete(`/hero-slides/${id}`);
      toast.success('Slide silindi');
      fetchSlides();
    } catch {
      toast.error('Silinirken hata oluştu');
    }
  };

  const inputCls = 'block w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-colors';
  const labelCls = 'block text-xs font-bold text-zinc-400 mb-1.5 uppercase tracking-wide';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Hero Slider</h1>
          <p className="text-sm text-zinc-500 mt-1">Anasayfa banner alanını yönetin. Aktif slide'lar sitede gösterilir.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => { setEditingSlide({ ...EMPTY_SLIDE }); setIsEditing(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 font-bold text-sm rounded-xl transition-colors"
          >
            <Plus size={16} /> Yeni Slide
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
      ) : isEditing ? (
        /* ── FORM ────────────────────────────────────────────────────── */
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-zinc-100 text-lg font-bold">{editingSlide?.id ? 'Slide Düzenle' : 'Yeni Slide'}</h2>
            <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-zinc-200 transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Sol: görsel + temel bilgiler ─────────────────────── */}
            <div className="space-y-4">

              {/* Görsel Yükleme Alanı */}
              <div>
                <label className={labelCls}>Hero Görseli</label>
                <div className="flex flex-col gap-2">
                  {/* Preview */}
                  {editingSlide.imageUrl ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-white/[0.05] border border-white/[0.08]">
                      <img
                        src={resolveUploadUrl(editingSlide.imageUrl)}
                        alt="Önizleme"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingSlide((p: any) => ({ ...p, imageUrl: '' }))}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-red-500/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-40 rounded-xl border-2 border-dashed border-white/[0.12] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-sky-500/40 hover:bg-sky-500/5 transition-all"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-zinc-500">Yükleniyor...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={28} className="text-zinc-400" />
                          <span className="text-sm font-bold text-zinc-400">Görsel Yükle</span>
                          <span className="text-xs text-zinc-400">Tıkla veya dosya sürükle • JPG, PNG, WebP</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Dosya Input (gizli) */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                  />

                  {/* Manuel URL alanı */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingSlide.imageUrl}
                      onChange={e => setEditingSlide((p: any) => ({ ...p, imageUrl: e.target.value }))}
                      className={`${inputCls} text-xs`}
                      placeholder="Veya görsel URL girin: https://..."
                    />
                    {!editingSlide.imageUrl && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex-shrink-0 px-3 py-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Upload size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Başlık</label>
                <input type="text" value={editingSlide.title} onChange={e => setEditingSlide((p: any) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="Güçlü bir başlık yazın" />
              </div>

              <div>
                <label className={labelCls}>Alt Başlık</label>
                <textarea value={editingSlide.subtitle} onChange={e => setEditingSlide((p: any) => ({ ...p, subtitle: e.target.value }))} className={`${inputCls} resize-none`} rows={2} placeholder="Kısa açıklama..." />
              </div>
            </div>

            {/* ── Sağ: butonlar + ayarlar ───────────────────────────── */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Sol Buton Metni</label>
                <input type="text" value={editingSlide.btnLeftText} onChange={e => setEditingSlide((p: any) => ({ ...p, btnLeftText: e.target.value }))} className={inputCls} placeholder="Ürünleri Keşfet" />
              </div>
              <div>
                <label className={labelCls}>Sol Buton Linki</label>
                <input type="text" value={editingSlide.btnLeftLink} onChange={e => setEditingSlide((p: any) => ({ ...p, btnLeftLink: e.target.value }))} className={inputCls} placeholder="/" />
              </div>
              <div>
                <label className={labelCls}>Sağ Buton Metni</label>
                <input type="text" value={editingSlide.btnRightText} onChange={e => setEditingSlide((p: any) => ({ ...p, btnRightText: e.target.value }))} className={inputCls} placeholder="Bayi Ol" />
              </div>
              <div>
                <label className={labelCls}>Sağ Buton Linki</label>
                <input type="text" value={editingSlide.btnRightLink} onChange={e => setEditingSlide((p: any) => ({ ...p, btnRightLink: e.target.value }))} className={inputCls} placeholder="/register-dealer" />
              </div>

              <div>
                <label className={labelCls}>Karartma Oranı (%{editingSlide.overlayOpacity})</label>
                <input
                  type="range" min="0" max="80" step="5"
                  value={editingSlide.overlayOpacity}
                  onChange={e => setEditingSlide((p: any) => ({ ...p, overlayOpacity: Number(e.target.value) }))}
                  className="w-full accent-sky-500"
                />
              </div>

              {/* Aktif toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingSlide.isActive}
                  onChange={e => setEditingSlide((p: any) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-zinc-600 bg-white/[0.05] accent-sky-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-zinc-300">
                  Aktif — Sitede göster
                </label>
                {editingSlide.isActive
                  ? <Eye size={14} className="text-emerald-400 ml-auto" />
                  : <EyeOff size={14} className="text-zinc-400 ml-auto" />
                }
              </div>
            </div>

            {/* ── Footer butonlar ───────────────────────────────────── */}
            <div className="col-span-2 border-t border-white/[0.06] pt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 font-bold text-sm rounded-xl transition-colors">
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-500/20 border border-sky-500/30 text-sky-300 hover:bg-sky-500/30 font-bold text-sm rounded-xl transition-colors disabled:opacity-50"
              >
                <Save size={15} /> Kaydet
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ── LISTE ───────────────────────────────────────────────────── */
        <div className="flex flex-col gap-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={`bg-white/[0.03] border rounded-2xl p-4 flex gap-4 items-center hover:bg-white/[0.05] transition-colors ${slide.isActive ? 'border-white/[0.08]' : 'border-zinc-800/60 opacity-60'}`}
            >
              {/* Görsel */}
              <div className="w-32 h-20 rounded-xl overflow-hidden bg-white/[0.05] flex-shrink-0 border border-white/[0.06]">
                {slide.imageUrl ? (
                  <img
                    src={resolveUploadUrl(slide.imageUrl)}
                    alt="Slide"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} className="text-zinc-400" />
                  </div>
                )}
              </div>

              {/* Bilgiler */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-zinc-100 truncate">{slide.title || '—'}</h3>
                  {slide.isActive
                    ? <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> Aktif</span>
                    : <span className="flex-shrink-0 text-xs font-bold text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full">Pasif</span>
                  }
                </div>
                <p className="text-sm text-zinc-500 line-clamp-1">{slide.subtitle}</p>
                {slide.btnLeftText && (
                  <div className="text-xs font-bold mt-1.5 text-sky-400">{slide.btnLeftText} → {slide.btnLeftLink}</div>
                )}
              </div>

              {/* Eylemler */}
              <div className="flex gap-2 flex-shrink-0">
                {/* Aktif/Pasif toggle */}
                <button
                  onClick={() => handleToggleActive(slide)}
                  title={slide.isActive ? 'Gizle' : 'Aktif Et'}
                  className={`p-2 rounded-lg transition-colors ${slide.isActive ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-500'}`}
                >
                  {slide.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => { setEditingSlide(slide); setIsEditing(true); }}
                  className="p-2 bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-zinc-100 rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl flex flex-col items-center gap-3">
              <ImageIcon size={36} className="text-zinc-500" />
              <p className="text-zinc-500 font-medium">Henüz slide eklenmemiş</p>
              <button
                onClick={() => { setEditingSlide({ ...EMPTY_SLIDE }); setIsEditing(true); }}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 font-bold text-sm rounded-xl transition-colors"
              >
                <Plus size={15} /> İlk Slide'ı Ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
