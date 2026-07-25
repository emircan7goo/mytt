'use client';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';
import {
  Search, Package, ImageIcon, ChevronLeft, ChevronRight,
  X, Eye, Loader2,
} from 'lucide-react';

// ── Sabitler ──────────────────────────────────────────────────────────────────

const GRADES = [
  { value: '',   label: 'Tüm Kaliteler' },
  { value: 'A+', label: 'A+ Kalite',   color: '#F97316' },
  { value: 'A',  label: 'A Kalite',    color: '#3b82f6' },
  { value: 'B',  label: 'B Kalite',    color: '#f59e0b' },
  { value: 'C',  label: 'C Kalite',    color: '#ef4444' },
];

const BRANDS = ['', 'Apple', 'Samsung', 'Xiaomi', 'POCO', 'Huawei', 'Vivo', 'Tecno', 'Infinix', 'Realme', 'Redmi'];

function gradeColor(g: string) {
  return GRADES.find(x => x.value === g)?.color ?? '#6b7280';
}

function gradeLabel(g: string) {
  return GRADES.find(x => x.value === g)?.label ?? g;
}

// ── Fotoğraf Galerisi Modal ────────────────────────────────────────────────────

function PhotoModal({ images, onClose }: { images: string[]; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const valid = images.filter(Boolean);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx(i => Math.min(valid.length - 1, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, valid.length]);

  if (!valid.length) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Kapatma */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80 transition"
        >
          <X size={16} />
        </button>

        {/* Fotoğraf */}
        <div className="bg-gray-100 flex items-center justify-center" style={{ minHeight: 350 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveUploadUrl(valid[idx])}
            alt={`Fotoğraf ${idx + 1}`}
            className="max-h-[420px] w-full object-contain"
          />
        </div>

        {/* Navigasyon + Thumbnail */}
        {valid.length > 1 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIdx(i => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-2 flex-1 overflow-x-auto">
                {valid.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={resolveUploadUrl(img)}
                    alt={`thumb ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`w-14 h-14 object-cover rounded-lg flex-shrink-0 cursor-pointer transition ${ i === idx ? 'ring-2 ring-black opacity-100' : 'opacity-60 hover:opacity-90' }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setIdx(i => Math.min(valid.length - 1, i + 1))}
                disabled={idx === valid.length - 1}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">{idx + 1} / {valid.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────

export default function AdminStocksPage() {
  const [items,     setItems]     = useState<any[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,   setLoading]   = useState(true);

  // Filtreler
  const [search, setSearch] = useState('');
  const [grade,  setGrade]  = useState('');
  const [brand,  setBrand]  = useState('');

  // Modal
  const [modalImages, setModalImages] = useState<string[] | null>(null);

  const LIMIT = 20;

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (grade)  params.set('grade',  grade);
      if (brand)  params.set('brand',  brand);
      params.set('page',  String(p));
      params.set('limit', String(LIMIT));

      const { data } = await apiClient.get(`/catalog/stock/admin-all?${params.toString()}`);
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
      setPage(p);
    } catch {
      toast.error('Veriler alınamadı');
    } finally {
      setLoading(false);
    }
  }, [search, grade, brand]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div style={{
        background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 16, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: 22, fontWeight: 800, margin: 0 }}>
            Bayi Stok Envanteri
          </h1>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 13, marginTop: 4 }}>
            Tüm bayilerin eklediği stok cihazları — fotoğraf ve IMEI dahil tam görünüm
          </p>
        </div>
        <div style={{
          background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: 12, padding: '10px 18px', textAlign: 'center',
        }}>
          <div style={{ color: '#a855f7', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{total}</div>
          <div style={{ color: 'rgba(168,85,247,0.7)', fontSize: 11, fontWeight: 600, marginTop: 2 }}>Toplam Kayıt</div>
        </div>
      </div>

      {/* Filtreler */}
      <form onSubmit={handleSearch} style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Arama */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,250,252,0.3)' }} />
          <input
            type="text"
            placeholder="Marka veya model ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: '#f8fafc', fontSize: 13, padding: '8px 12px 8px 34px',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Kalite */}
        <select
          value={grade}
          onChange={e => setGrade(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#f8fafc', fontSize: 13, padding: '8px 12px',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {GRADES.map(g => (
            <option key={g.value} value={g.value} style={{ background: '#1a1a2e', color: '#f8fafc' }}>
              {g.label}
            </option>
          ))}
        </select>

        {/* Marka */}
        <select
          value={brand}
          onChange={e => setBrand(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#f8fafc', fontSize: 13, padding: '8px 12px',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {BRANDS.map(b => (
            <option key={b} value={b} style={{ background: '#1a1a2e', color: '#f8fafc' }}>
              {b || 'Tüm Markalar'}
            </option>
          ))}
        </select>

        <button
          type="submit"
          style={{
            background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)',
            color: '#a855f7', borderRadius: 10, fontSize: 13, fontWeight: 700,
            padding: '8px 18px', cursor: 'pointer',
          }}
        >
          Ara
        </button>
      </form>

      {/* Tablo */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              {['Fotoğraflar', 'Model', 'Kalite', 'Bayi', 'Pil', 'Stok', 'Fiyat', 'IMEI'].map(h => (
                <th key={h} style={{ padding: '10px 14px', color: 'rgba(248,250,252,0.35)', fontWeight: 700, textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#a855f7', margin: '0 auto' }} />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'rgba(248,250,252,0.3)' }}>
                  <Package size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p>Filtrelere uygun stok kaydı bulunamadı</p>
                </td>
              </tr>
            ) : (
              items.map(item => {
                const validImgs = (item.dealerImages ?? []).filter(Boolean);
                const gColor = gradeColor(item.grade);
                const price = Number(item.price).toLocaleString('tr-TR');
                return (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    className="admin-stock-row"
                  >
                    {/* Fotoğraflar */}
                    <td style={{ padding: '10px 14px' }}>
                      {validImgs.length > 0 ? (
                        <button
                          onClick={() => setModalImages(validImgs)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          title="Fotoğrafları görüntüle"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveUploadUrl(validImgs[0])}
                            alt="stok"
                            style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Eye size={12} color="#a855f7" />
                            <span style={{ color: '#a855f7', fontSize: 10, fontWeight: 700 }}>
                              {validImgs.length} foto
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={18} color="rgba(255,255,255,0.2)" />
                        </div>
                      )}
                    </td>

                    {/* Model */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ color: '#f8fafc', fontWeight: 700 }}>
                        {item.globalProduct?.brand} {item.globalProduct?.model}
                      </div>
                      <div style={{ color: 'rgba(248,250,252,0.4)', fontSize: 11, marginTop: 2 }}>
                        {item.globalProduct?.storage}
                        {item.globalProduct?.color ? ` · ${item.globalProduct.color}` : ''}
                      </div>
                    </td>

                    {/* Kalite */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        background: `${gColor}18`, color: gColor,
                        border: `1px solid ${gColor}40`,
                        borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 800,
                      }}>
                        {gradeLabel(item.grade)}
                      </span>
                    </td>

                    {/* Bayi */}
                    <td style={{ padding: '10px 14px', color: 'rgba(248,250,252,0.7)', fontSize: 12 }}>
                      {item.store?.name ?? '—'}
                    </td>

                    {/* Pil */}
                    <td style={{ padding: '10px 14px', color: 'rgba(248,250,252,0.5)', fontSize: 12 }}>
                      {item.batteryHealth ? `%${item.batteryHealth}` : '—'}
                    </td>

                    {/* Stok */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: item.stock > 0 ? '#F97316' : '#ef4444', fontWeight: 700 }}>
                        {item.stock}
                      </span>
                      <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: 11 }}> adet</span>
                    </td>

                    {/* Fiyat */}
                    <td style={{ padding: '10px 14px', color: '#f8fafc', fontWeight: 900 }}>
                      {price} ₺
                    </td>

                    {/* IMEI */}
                    <td style={{ padding: '10px 14px' }}>
                      {item.imei ? (
                        <span style={{
                          fontFamily: 'monospace', fontSize: 11,
                          background: 'rgba(168,85,247,0.1)', color: '#c084fc',
                          border: '1px solid rgba(168,85,247,0.2)',
                          borderRadius: 6, padding: '2px 6px',
                        }}>
                          {item.imei}
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(248,250,252,0.2)', fontSize: 11 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => fetchData(page - 1)}
            disabled={page === 1}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: page === 1 ? 'rgba(248,250,252,0.2)' : '#f8fafc',
              borderRadius: 8, padding: '6px 10px', cursor: page === 1 ? 'default' : 'pointer',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: 'rgba(248,250,252,0.5)', fontSize: 13 }}>
            Sayfa {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchData(page + 1)}
            disabled={page === totalPages}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: page === totalPages ? 'rgba(248,250,252,0.2)' : '#f8fafc',
              borderRadius: 8, padding: '6px 10px', cursor: page === totalPages ? 'default' : 'pointer',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Fotoğraf Modal */}
      {modalImages && (
        <PhotoModal images={modalImages} onClose={() => setModalImages(null)} />
      )}
    </div>
  );
}
