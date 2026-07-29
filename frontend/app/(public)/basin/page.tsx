import Link from 'next/link';
import { Newspaper } from 'lucide-react';

export default function BasinPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Newspaper size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Basın & Medya Kiti</h1>
            <p className="text-sm text-slate-500 font-medium">Mytt Haberleri, Basın Bültenleri ve Görsel Materyaller</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Mytt Teknoloji A.Ş. ile ilgili tüm basın bültenleri, logo arşivleri ve yöneticilerimizin demeçleri için basın ilişkileri ekibimizle iletişime geçebilirsiniz.
          </p>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-black text-slate-900 text-sm">Basın İletişim Hattı:</h4>
            <p className="text-xs text-slate-600 mt-1">basin@mytt.com.tr · 0850 308 00 00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
