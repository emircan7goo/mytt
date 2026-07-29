import Link from 'next/link';
import { Lock, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';

export default function GuvenliOdemePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Güvenli Ödeme & Escrow Koruması</h1>
            <p className="text-sm text-slate-500 font-medium">256-Bit SSL Şifreleme & Alıcı-Satıcı Havuz Hesabı</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Mytt platformunda tüm ödemeler 256-bit SSL sertifikalı banka altyapısı ve BDDK lisanslı Escrow havuz hesabı üzerinden gerçekleşir.
          </p>

          <h3 className="text-base font-black text-slate-900">Escrow Sistemi Nasıl Çalışır?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slate-800">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-orange-600 font-black">1. Ödeme Bloke Edilir</div>
              <p className="text-slate-600 font-medium">Alıcının ödemesi Escrow havuz hesabında güvenle bekletilir.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-orange-600 font-black">2. Ekspertiz Onayı</div>
              <p className="text-slate-600 font-medium">Cihaz TSE merkezinde 32 noktadan test edilip doğrulanır.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-emerald-600 font-black">3. Paranın Aktarımı</div>
              <p className="text-slate-600 font-medium">Teslimat onayından sonra ödeme satıcının hesabına eksiksiz aktarılır.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
