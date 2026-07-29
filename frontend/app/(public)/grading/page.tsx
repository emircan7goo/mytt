import Link from 'next/link';
import { Award, CheckCircle2 } from 'lucide-react';

export default function GradingPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Kozmetik Grading & Kondisyon Standartları</h1>
            <p className="text-sm text-slate-500 font-medium">TSE Standartlarında Şeffaf Derecelendirme</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs">A+ Kusursuz</span>
            <p className="text-xs text-slate-600 font-medium">Kılcal çizik dahi içermeyen, sıfır cihaz kondisyonundaki yenilenmiş telefonlar.</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500 text-white font-black text-xs">A Çok İyi</span>
            <p className="text-xs text-slate-600 font-medium">Sadece mikro düzeyde gözle zor fark edilen hafif izler barındıran mükemmel kondisyon.</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-black text-xs">B İyi</span>
            <p className="text-xs text-slate-600 font-medium">Normal kullanım izleri barındıran, 100% donanımsal kusursuzlukta uygun fiyatlı cihazlar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
