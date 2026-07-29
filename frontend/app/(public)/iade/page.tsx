import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function IadePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <RotateCcw size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">İade ve Değişim Prosedürü</h1>
            <p className="text-sm text-slate-500 font-medium">14 Gün Koşulsuz İade Hakkı & Kesintisiz Destek</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Mytt üzerinden satın aldığınız yenilenmiş cihazları teslim aldığınız tarihten itibaren 14 gün boyunca hiçbir sebep göstermeksizin koşulsuz iade edebilirsiniz.
          </p>

          <h3 className="text-base font-black text-slate-900">İade Adımları:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Hesabım paneli üzerinden İade Talebi oluşturun.</li>
            <li>Size iletilen ücretsiz kargo kodu ile cihazı orijinal kutusuyla paketleyin.</li>
            <li>Cihaz TSE ekspertiz merkezimize ulaştığında 24 saat içinde ücret iadeniz bankanıza aktarılır.</li>
          </ol>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 text-orange-900 font-bold text-xs space-y-2">
            <div className="flex items-center gap-2 text-sm font-black text-orange-600">
              <ShieldCheck size={18} />
              <span>Garanti Kapsamında Ücretsiz Değişim</span>
            </div>
            <p>14 günlük süreden sonra oluşan donanımsal arızalarda TSE 12 Ay Garanti kapsamında cihazınız ücretsiz onarılır veya birebir yenisiyle değiştirilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
