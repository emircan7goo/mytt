import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function YatirimcilarPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Yatırımcı İlişkileri</h1>
            <p className="text-sm text-slate-500 font-medium">Büyüme Raporları ve Finansal Şeffaflık</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Mytt Teknoloji A.Ş., döngüsel teknoloji ekonomisinde Türkiye'nin en hızlı büyüyen dijital pazaryeri platformudur.
          </p>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-black text-slate-900 text-sm">Yatırımcı İletişim:</h4>
            <p className="text-xs text-slate-600 mt-1">ir@mytt.com.tr · Maslak Mah. Büyükdere Cad. No:245, İstanbul</p>
          </div>
        </div>
      </div>
    </div>
  );
}
