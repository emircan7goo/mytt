'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { LifeBuoy, Plus, Send, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: 'Bekliyor',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  IN_PROGRESS: { label: 'Yanıtlandı',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)'  },
  CLOSED:      { label: 'Kapatıldı',    color: '#94a3b8', bg: 'rgba(148,163,184,0.1)'  },
};

const SUBJECTS = [
  'Ürün ilanı ile ilgili sorun',
  'Sipariş / ödeme sorunu',
  'Hesap askıya alındı',
  'Komisyon oranı ile ilgili',
  'Teknik hata bildirimi',
  'Diğer',
];

export default function DealerSupportPage() {
  const [tickets, setTickets]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [subject, setSubject]     = useState('');
  const [message, setMessage]     = useState('');
  const [sending, setSending]     = useState(false);
  const [toast, setToast]         = useState('');

  const showMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = () => {
    setLoading(true);
    apiClient.get('/tickets/my')
      .then((r) => setTickets(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message.trim()) return;
    setSending(true);
    try {
      await apiClient.post('/tickets', { subject, message });
      showMsg('Talebiniz iletildi. En kısa sürede yanıtlanacak.');
      setShowForm(false);
      setSubject('');
      setMessage('');
      load();
    } catch {
      showMsg('Gönderilirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 text-sm font-semibold backdrop-blur-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-50 text-2xl font-bold tracking-tight">Destek Merkezi</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Sorununuzu bildirin, admin ekibi yanıtlasın.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={15}/> Yeni Talep
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl w-full max-w-lg p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                  <LifeBuoy size={16} className="text-sky-400"/>
                </div>
                <h3 className="text-zinc-100 font-bold text-[16px]">Destek Talebi Oluştur</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <div>
                <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mb-2 block">
                  Konu
                </label>
                <select
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 appearance-none"
                >
                  <option value="">Konu seçin…</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mb-2 block">
                  Açıklama
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sorununuzu detaylı açıklayın…"
                  className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex-1 justify-center"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  ) : <Send size={14}/>}
                  {sending ? 'Gönderiliyor…' : 'Gönder'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Talepler listesi */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500 text-sm">Yükleniyor…</div>
      ) : tickets.length === 0 ? (
        <div className="py-20 text-center">
          <LifeBuoy size={36} className="text-zinc-500 mx-auto mb-4"/>
          <p className="text-zinc-400 font-semibold">Henüz destek talebi açmadınız</p>
          <p className="text-zinc-400 text-sm mt-1">Sorun yaşıyorsanız yeni talep oluşturun.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => {
            const s = STATUS_MAP[t.status] ?? STATUS_MAP.OPEN;
            return (
              <div
                key={t.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-zinc-100 font-semibold text-[14px]">{t.subject}</p>
                    <p className="text-zinc-500 text-[12px] mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-bold flex-shrink-0"
                    style={{ color: s.color, background: s.bg }}
                  >
                    {s.label}
                  </span>
                </div>

                <p className="text-zinc-400 text-[13px] leading-relaxed bg-zinc-800/40 rounded-xl px-4 py-3">
                  {t.message}
                </p>

                {t.adminReply && (
                  <div className="bg-sky-500/8 border border-sky-500/20 rounded-xl px-4 py-3">
                    <p className="text-sky-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                      Admin Yanıtı — {t.repliedAt ? new Date(t.repliedAt).toLocaleDateString('tr-TR') : ''}
                    </p>
                    <p className="text-zinc-300 text-[13px] leading-relaxed">{t.adminReply}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
