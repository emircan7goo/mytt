'use client';
import { useState } from 'react';
import { X, ArrowDownToLine, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRequestPayout } from '@/lib/hooks/usePayout';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

interface Props {
  withdrawable: number;
  defaultIban?:     string | null;
  defaultIbanName?: string | null;
  onClose: () => void;
}

export default function PayoutRequestModal({ withdrawable, defaultIban, defaultIbanName, onClose }: Props) {
  const [iban, setIban]         = useState(defaultIban ?? '');
  const [ibanName, setIbanName] = useState(defaultIbanName ?? '');
  const requestPayout = useRequestPayout();

  const handleSubmit = async () => {
    const cleanIban = iban.replace(/\s+/g, '').toUpperCase();
    if (!cleanIban.startsWith('TR') || cleanIban.length !== 26) {
      toast.error('Geçerli bir IBAN girin (TR ile başlayan 26 karakter).');
      return;
    }
    if (!ibanName.trim()) {
      toast.error('Hesap sahibinin adını girin.');
      return;
    }
    try {
      await requestPayout.mutateAsync({ iban: cleanIban, ibanName: ibanName.trim() });
      toast.success('Çekim talebiniz oluşturuldu — admin onayından sonra hesabınıza aktarılacak.');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Talep oluşturulamadı.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(5,8,15,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420, background: '#0d1117',
          border: '1px solid rgba(0,208,132,0.25)', borderRadius: 20, padding: 28,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,208,132,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownToLine size={17} color="#00D084" />
            </div>
            <h3 style={{ color: '#f8fafc', fontSize: 16, fontWeight: 800, margin: 0 }}>Bakiyeyi Çek</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(248,250,252,0.4)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'rgba(0,208,132,0.06)', border: '1px solid rgba(0,208,132,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <p style={{ color: 'rgba(0,208,132,0.7)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
            Talep Edilecek Tutar
          </p>
          <p style={{ color: '#00D084', fontSize: 26, fontWeight: 800, margin: 0 }}>{fmt(withdrawable)}</p>
        </div>

        <label style={{ display: 'block', color: 'rgba(248,250,252,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          IBAN
        </label>
        <input
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="TR00 0000 0000 0000 0000 0000 00"
          style={{
            width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, marginBottom: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f8fafc', fontSize: 13, fontFamily: 'monospace', outline: 'none',
          }}
        />

        <label style={{ display: 'block', color: 'rgba(248,250,252,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Hesap Sahibi
        </label>
        <input
          value={ibanName}
          onChange={(e) => setIbanName(e.target.value)}
          placeholder="Ad Soyad / Şirket Ünvanı"
          style={{
            width: '100%', boxSizing: 'border-box', padding: '11px 14px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f8fafc', fontSize: 13, outline: 'none',
          }}
        />

        <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 11, marginBottom: 16, lineHeight: 1.5 }}>
          Talebiniz admin onayından sonra elden EFT/havale ile IBAN&apos;ınıza gönderilir. Otomatik anlık transfer değildir.
        </p>

        <button
          onClick={handleSubmit}
          disabled={requestPayout.isPending}
          style={{
            width: '100%', padding: 14, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #00D084, #00a86b)',
            color: '#001a0d', fontSize: 14, fontWeight: 800, cursor: requestPayout.isPending ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: requestPayout.isPending ? 0.7 : 1,
          }}
        >
          {requestPayout.isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownToLine size={16} />}
          Talebi Gönder
        </button>
      </div>
    </div>
  );
}
