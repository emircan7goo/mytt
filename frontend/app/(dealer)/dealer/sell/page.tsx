'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import {
  ChevronRight, ChevronLeft, Check, Upload, X,
  AlertTriangle, Clock, Tag, Gavel, ArrowRight,
  Loader2, Package, Image as ImageIcon,
} from 'lucide-react';

// ── Sabit veriler ─────────────────────────────────────────────────────────────

const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'OnePlus', 'Realme', 'Nokia', 'Motorola', 'Diğer'];
const STORAGES = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
const COLORS = ['Siyah', 'Beyaz', 'Gümüş', 'Altın', 'Mavi', 'Kırmızı', 'Yeşil', 'Mor', 'Pembe', 'Sarı', 'Diğer'];
const GRADES = [
  { value: 'A+', label: 'A+ — Sıfır gibi', desc: 'Hiç kullanılmamış, kutusunda',  color: '#10b981' },
  { value: 'A',  label: 'A — Çok iyi',      desc: 'Çok az kullanılmış, görünür iz yok', color: '#0ea5e9' },
  { value: 'B',  label: 'B — İyi',           desc: 'Normal kullanım izleri mevcut',  color: '#f59e0b' },
  { value: 'C',  label: 'C — Orta',          desc: 'Belirgin çizikler/izler var',    color: '#ef4444' },
];
const DURATIONS = [
  { value: 0.5,  label: '30 Dakika' },
  { value: 1,    label: '1 Saat'    },
  { value: 6,    label: '6 Saat'    },
  { value: 24,   label: '1 Gün'     },
];

// ── Yardımcı ─────────────────────────────────────────────────────────────────

const field = (style?: React.CSSProperties): React.CSSProperties => ({
  width: '100%', padding: '12px 16px', borderRadius: '12px', fontSize: '14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  ...style,
});

const label = (style?: React.CSSProperties): React.CSSProperties => ({
  display: 'block', color: 'rgba(248,250,252,0.55)', fontSize: '11px',
  fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '6px',
  ...style,
});

// ── Adım göstergesi ──────────────────────────────────────────────────────────

const STEP_LABELS = ['Cihaz Bilgisi', 'Durum', 'Fotoğraflar', 'Fiyat & Tip'];

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {STEP_LABELS.map((lbl, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 'none' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? '#10b981' : active ? '#0ea5e9' : 'rgba(255,255,255,0.07)',
                border: done ? 'none' : active ? '2px solid #0ea5e9' : '2px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {done
                  ? <Check size={14} color="#fff" />
                  : <span style={{ color: active ? '#0ea5e9' : 'rgba(248,250,252,0.3)', fontSize: '13px', fontWeight: 700 }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: active ? '#0ea5e9' : done ? '#10b981' : 'rgba(248,250,252,0.25)', whiteSpace: 'nowrap' }}>{lbl}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#10b981' : 'rgba(255,255,255,0.07)', margin: '0 6px 16px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Chip seçici ──────────────────────────────────────────────────────────────

function ChipSelect({ options, value, onChange, color = '#0ea5e9' }: {
  options: string[], value: string, onChange: (v: string) => void, color?: string
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          style={{
            padding: '7px 14px', borderRadius: '9px', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid',
            background: value === opt ? `${color}18` : 'rgba(255,255,255,0.04)',
            borderColor: value === opt ? color : 'rgba(255,255,255,0.1)',
            color: value === opt ? color : 'rgba(248,250,252,0.55)',
            transition: 'all 0.15s',
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── Fotoğraf yükleme alanı ────────────────────────────────────────────────────

function PhotoUpload({ images, onChange }: { images: string[], onChange: (imgs: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setErr('');
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (images.length + urls.length >= 8) break;
      const fd = new FormData();
      fd.append('file', file);
      try {
        const { data } = await apiClient.post('/uploads/image', fd);
        urls.push(data.url ?? data);
      } catch {
        setErr('Bir görsel yüklenemedi, lütfen tekrar deneyin.');
      }
    }
    setUploading(false);
    onChange([...images, ...urls]);
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Uyarı banner */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
        borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
        marginBottom: 16,
      }}>
        <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ color: '#f59e0b', fontWeight: 700, fontSize: '12px', margin: 0 }}>
            Görsellerde bayi etiketi, sticker veya logonuz olmamalı
          </p>
          <p style={{ color: 'rgba(245,158,11,0.7)', fontSize: '11px', margin: '3px 0 0' }}>
            Arka yüzde etiketi olan cihazlar admin onayında otomatik reddedilir. Etiketi çıkardıktan sonra fotoğraf çekin.
          </p>
        </div>
      </div>

      {/* Önizleme grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, marginBottom: 12 }}>
        {images.map((url, idx) => (
          <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <img src={resolveUploadUrl(url)} alt={`foto-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => remove(idx)} style={{
              position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={12} color="#fff" />
            </button>
            {idx === 0 && (
              <div style={{ position: 'absolute', bottom: 4, left: 4, padding: '2px 6px', borderRadius: '6px', background: 'rgba(14,165,233,0.85)', color: '#fff', fontSize: '9px', fontWeight: 700 }}>
                Kapak
              </div>
            )}
          </div>
        ))}

        {/* Upload kutusu */}
        {images.length < 8 && (
          <button onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: '1', borderRadius: '10px', border: '2px dashed rgba(14,165,233,0.3)',
              background: 'rgba(14,165,233,0.04)', cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            {uploading
              ? <Loader2 size={20} style={{ color: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
              : <><Upload size={18} style={{ color: '#0ea5e9' }} /><span style={{ color: '#0ea5e9', fontSize: '10px', fontWeight: 700 }}>Ekle</span></>
            }
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: images.length < 3 ? '#ef4444' : '#10b981', fontSize: '12px', fontWeight: 600 }}>
          {images.length} / 8 fotoğraf {images.length < 3 ? `(en az 3 gerekli, ${3 - images.length} daha ekle)` : '✓'}
        </span>
        <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px' }}>İlk fotoğraf kapak olur</span>
      </div>
      {err && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: 6 }}>{err}</p>}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function DealerSellPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ id: string } | null>(null);
  const [error,   setError]   = useState('');

  // Form state
  const [brand,     setBrand]     = useState('');
  const [model,     setModel]     = useState('');
  const [storage,   setStorage]   = useState('');
  const [color,     setColor]     = useState('');
  const [grade,     setGrade]     = useState('');
  const [battery,   setBattery]   = useState('');
  const [hasBox,    setHasBox]    = useState(false);
  const [hasInvoice,setHasInvoice]= useState(false);
  const [hasAcc,    setHasAcc]    = useState(false);
  const [desc,      setDesc]      = useState('');
  const [images,    setImages]    = useState<string[]>([]);
  const [listType,  setListType]  = useState<'AUCTION' | 'DIRECT'>('DIRECT');
  const [floorPrice,setFloorPrice]= useState('');
  const [directPrice,setDirectPrice]= useState('');
  const [duration,  setDuration]  = useState(1);

  // Doğrulama
  const step0Valid = brand && model;
  const step1Valid = !!grade;
  const step2Valid = images.length >= 3;
  const step3Valid = listType === 'DIRECT' ? !!directPrice : true;

  const canNext = [step0Valid, step1Valid, step2Valid, step3Valid][step];

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        brand, model, storage: storage || undefined, color: color || undefined,
        grade, batteryHealth: battery ? Number(battery) : undefined,
        hasBox, hasInvoice, hasAccessories: hasAcc,
        description: desc || undefined, images,
        listingType: listType,
        durationHours: listType === 'AUCTION' ? duration : undefined,
        floorPrice: floorPrice ? Number(floorPrice) : undefined,
        directPrice: directPrice ? Number(directPrice) : undefined,
      };
      const { data } = await apiClient.post('/dealer-market', payload);
      setSuccess({ id: data.id });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // ── Başarı ekranı ────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(14,165,233,0.1))',
          border: '2px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Clock size={36} style={{ color: '#10b981' }} />
        </div>
        <h2 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>
          İlan Oluşturuldu
        </h2>
        <p style={{ color: 'rgba(248,250,252,0.55)', fontSize: '14px', lineHeight: 1.7, margin: '0 0 32px' }}>
          İlanınız admin onayına gönderildi. Onaylandıktan sonra diğer bayilere görünür hale gelecek.
          Genellikle <strong style={{ color: '#f8fafc' }}>birkaç dakika</strong> içinde onaylanır.
        </p>
        <div style={{
          padding: '16px', borderRadius: '14px',
          background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
          marginBottom: 24,
        }}>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>
            İlan ID
          </p>
          <p style={{ color: '#10b981', fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', margin: 0 }}>
            {success.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => { setSuccess(null); setStep(0); setBrand(''); setModel(''); setStorage(''); setColor(''); setGrade(''); setBattery(''); setHasBox(false); setHasInvoice(false); setHasAcc(false); setDesc(''); setImages([]); setListType('DIRECT'); setFloorPrice(''); setDirectPrice(''); setDuration(1); }}
            style={{
              padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
              color: '#0ea5e9', cursor: 'pointer',
            }}>
            Yeni İlan Oluştur
          </button>
          <button onClick={() => router.push('/dealer/buy-requests')}
            style={{
              padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              background: '#0ea5e9', border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            Pazaryerine Git <ArrowRight size={14} />
          </button>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Başlık */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>
          Cihaz Sat
        </h1>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', margin: '4px 0 0' }}>
          Elinizdeki cihazı diğer bayilere satın — sabit fiyat veya açık artırma ile
        </p>
      </div>

      {/* Adım göstergesi */}
      <StepBar current={step} />

      {/* Kart */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.07)', padding: '28px',
      }}>

        {/* ── Adım 0: Cihaz Bilgisi ──────────────────────────────────────────── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={label()}>Marka *</label>
              <ChipSelect options={BRANDS} value={brand} onChange={setBrand} />
              {brand === 'Diğer' && (
                <input value={model === '' ? '' : brand} placeholder="Marka adı yazın..."
                  onChange={e => setBrand(e.target.value)}
                  style={{ ...field(), marginTop: 10 }} />
              )}
            </div>

            <div>
              <label style={label()}>Model *</label>
              <input value={model} onChange={e => setModel(e.target.value)}
                placeholder="Örn: iPhone 15 Pro, Galaxy S24 Ultra..."
                style={field()} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={label()}>Depolama</label>
                <ChipSelect options={STORAGES} value={storage} onChange={setStorage} />
              </div>
              <div>
                <label style={label()}>Renk</label>
                <ChipSelect options={COLORS} value={color} onChange={setColor} />
              </div>
            </div>
          </div>
        )}

        {/* ── Adım 1: Durum ──────────────────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <label style={label()}>Cihaz Durumu (Grade) *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {GRADES.map(g => (
                  <button key={g.value} onClick={() => setGrade(g.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: '12px', textAlign: 'left',
                      cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
                      background: grade === g.value ? `${g.color}10` : 'rgba(255,255,255,0.03)',
                      borderColor: grade === g.value ? g.color : 'rgba(255,255,255,0.08)',
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '8px', flexShrink: 0,
                      background: grade === g.value ? `${g.color}20` : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: g.color, fontWeight: 800, fontSize: '14px' }}>{g.value}</span>
                    </div>
                    <div>
                      <p style={{ color: grade === g.value ? g.color : '#f8fafc', fontWeight: 700, fontSize: '13px', margin: 0 }}>{g.label}</p>
                      <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', margin: '2px 0 0' }}>{g.desc}</p>
                    </div>
                    {grade === g.value && <Check size={16} style={{ color: g.color, marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={label()}>Batarya Sağlığı</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input value={battery} onChange={e => setBattery(e.target.value)}
                  type="number" min="1" max="100" placeholder="Örn: 91"
                  style={{ ...field(), width: 120 }} />
                <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '14px' }}>%</span>
              </div>
            </div>

            <div>
              <label style={label()}>Aksesuar Durumu</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { key: 'box',     label: 'Kutulu',    val: hasBox,     set: setHasBox     },
                  { key: 'invoice', label: 'Faturalı',  val: hasInvoice, set: setHasInvoice },
                  { key: 'acc',     label: 'Aksesuarlı',val: hasAcc,     set: setHasAcc     },
                ].map(({ key, label: lbl, val, set }) => (
                  <button key={key} onClick={() => set(!val)}
                    style={{
                      padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', border: '1px solid',
                      background: val ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                      borderColor: val ? '#10b981' : 'rgba(255,255,255,0.1)',
                      color: val ? '#10b981' : 'rgba(248,250,252,0.5)',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                    {val && <Check size={12} />} {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={label()}>Açıklama (isteğe bağlı)</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)}
                placeholder="Cihaz hakkında ek bilgi, kusur veya dikkat çekmek istediğiniz bir şey..."
                rows={3}
                style={{ ...field(), resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* ── Adım 2: Fotoğraflar ────────────────────────────────────────────── */}
        {step === 2 && (
          <PhotoUpload images={images} onChange={setImages} />
        )}

        {/* ── Adım 3: Fiyat & Tip ────────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <label style={label()}>Listeleme Tipi *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'DIRECT', icon: Tag,   title: 'Sabit Fiyat', desc: 'Belirlediğiniz fiyatla ilk teklif eden alır' },
                  { value: 'AUCTION', icon: Gavel, title: 'Açık Artırma', desc: 'Bayiler körlemesine teklif verir, süre bitince en yüksek teklif kazanır' },
                ].map(({ value, icon: Icon, title, desc: d }) => (
                  <button key={value} onClick={() => setListType(value as any)}
                    style={{
                      padding: '18px', borderRadius: '14px', textAlign: 'left', cursor: 'pointer',
                      border: '1px solid', transition: 'all 0.15s',
                      background: listType === value ? 'rgba(14,165,233,0.08)' : 'rgba(255,255,255,0.03)',
                      borderColor: listType === value ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <Icon size={18} style={{ color: listType === value ? '#0ea5e9' : 'rgba(248,250,252,0.4)' }} />
                      <span style={{ color: listType === value ? '#0ea5e9' : '#f8fafc', fontWeight: 700, fontSize: '14px' }}>{title}</span>
                      {listType === value && <Check size={14} style={{ color: '#0ea5e9', marginLeft: 'auto' }} />}
                    </div>
                    <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', lineHeight: 1.5, margin: 0 }}>{d}</p>
                  </button>
                ))}
              </div>
            </div>

            {listType === 'DIRECT' && (
              <div>
                <label style={label()}>Satış Fiyatı (₺) *</label>
                <input value={directPrice} onChange={e => setDirectPrice(e.target.value)}
                  type="number" min="1" placeholder="Örn: 28000"
                  style={field()} />
              </div>
            )}

            {listType === 'AUCTION' && (
              <>
                <div>
                  <label style={label()}>Taban Fiyat (₺) — isteğe bağlı</label>
                  <input value={floorPrice} onChange={e => setFloorPrice(e.target.value)}
                    type="number" min="1" placeholder="Teklifler bu rakamın altında kabul edilmez"
                    style={field()} />
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', marginTop: 6 }}>
                    Boş bırakırsanız taban fiyat uygulanmaz.
                  </p>
                </div>
                <div>
                  <label style={label()}>Artırma Süresi *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {DURATIONS.map(d => (
                      <button key={d.value} onClick={() => setDuration(d.value)}
                        style={{
                          padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                          cursor: 'pointer', border: '1px solid',
                          background: duration === d.value ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.04)',
                          borderColor: duration === d.value ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                          color: duration === d.value ? '#0ea5e9' : 'rgba(248,250,252,0.5)',
                        }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Özet */}
            <div style={{
              padding: '16px', borderRadius: '14px',
              background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.12)',
            }}>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
                İlan Özeti
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Cihaz', `${brand} ${model}`],
                  ['Depolama', storage || '—'],
                  ['Durum', grade || '—'],
                  ['Batarya', battery ? `%${battery}` : '—'],
                  ['Fotoğraf', `${images.length} adet`],
                  ['Tip', listType === 'DIRECT' ? 'Sabit Fiyat' : 'Açık Artırma'],
                  ['Fiyat', listType === 'DIRECT' ? (directPrice ? `${Number(directPrice).toLocaleString('tr-TR')} ₺` : '—') : (floorPrice ? `Taban: ${Number(floorPrice).toLocaleString('tr-TR')} ₺` : 'Tabansız')],
                  listType === 'AUCTION' ? ['Süre', `${duration < 1 ? '30 dk' : duration + ' saat'}`] : ['Renk', color || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: 'rgba(248,250,252,0.35)', fontSize: '12px' }}>{k}</span>
                    <span style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hata */}
      {error && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Nav butonları */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(248,250,252,0.6)', cursor: 'pointer',
            }}>
            <ChevronLeft size={15} /> Geri
          </button>
        ) : <div />}

        {step < 3 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              background: canNext ? '#0ea5e9' : 'rgba(255,255,255,0.06)',
              border: 'none', color: canNext ? '#fff' : 'rgba(248,250,252,0.25)',
              cursor: canNext ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
            }}>
            Devam <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={submit} disabled={!canNext || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
              background: canNext && !loading ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'rgba(255,255,255,0.06)',
              border: 'none', color: canNext && !loading ? '#fff' : 'rgba(248,250,252,0.25)',
              cursor: canNext && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
              boxShadow: canNext && !loading ? '0 4px 14px rgba(14,165,233,0.3)' : 'none',
            }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Gönderiliyor...</> : <><Package size={15} /> İlanı Yayınla</>}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder, textarea::placeholder { color: rgba(248,250,252,0.25); }
        input:focus, textarea:focus, select:focus { border-color: rgba(14,165,233,0.5) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.1); }
        button:hover:not(:disabled) { filter: brightness(1.08); }
      `}</style>
    </div>
  );
}
