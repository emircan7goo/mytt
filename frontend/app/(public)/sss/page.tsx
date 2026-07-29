'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';

const FAQS = [
  {
    q: 'Mytt sisteminde cihazımı nasıl satabilirim?',
    a: 'Cihaz bilgilerini ve fotoğraflarını sistemimize girersiniz. 150+ onaylı yetkili bayi cihazınız için kapalı açık artırma tekliflerinde yarışır. En yüksek teklifi seçtiğinizde kuryemiz cihazınızı kapınızdan ücretsiz teslim alır.',
  },
  {
    q: 'Ödeme süreci ve Escrow güvencesi nasıl çalışır?',
    a: 'Alıcının ödemesi Escrow havuz hesabında bloke edilir. Cihazınız TSE belgeli merkezimizde 32-nokta ekspertiz kontrolünden geçip onaylandıktan sonra paranız anında banka hesabınıza aktarılır.',
  },
  {
    q: 'Cihaz garantisi neleri kapsıyor?',
    a: 'Mytt üzerinden satılan tüm yenilenmiş cihazlar 12 ay boyunca TSE onaylı teknik servisimiz tarafından garanti altındadır. Donanımsal arızalarda ücretsiz onarım veya değişim hakkı sunulur.',
  },
  {
    q: 'Kargo ve kurye ücreti ödeyecek miyim?',
    a: 'Hayır, Mytt platformunda hem alıcılar hem de satıcılar için tüm kargo ve adresten ücretsiz kurye hizmeti tamamen ücretsizdir.',
  },
  {
    q: 'Satış sürecinde cayma hakkım var mıdır?',
    a: 'Cihazınızı kuryeye teslim edene kadar dilediğiniz an teklifi iptal edebilir veya satıştan vazgeçebilirsiniz.',
  },
];

export default function SSSPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto space-y-10">

        {/* Hero Header */}
        <div className="text-center space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs tracking-wider uppercase border border-orange-200">
            DESTEK MERKEZİ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Sıkça Sorulan <span className="text-orange-600">Sorular</span>
          </h1>
          <p className="text-slate-600 text-base font-medium">
            Alış, satış, ödeme ve kargo süreçleri hakkında merak ettiğiniz tüm soruların yanıtları.
          </p>
        </div>

        {/* Akordiyon Listesi */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={faq.q} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left font-black text-base text-slate-900 flex items-center justify-between gap-4 hover:text-orange-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-600' : 'text-slate-400'}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* İletişim Yönlendirmesi */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">Aradığınız cevabı bulamadınız mı?</h3>
          <p className="text-slate-600 text-sm font-medium">Canlı destek ekibimiz 7/24 sorularınızı yanıtlamak için hazır.</p>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all"
          >
            <span>Bize Ulaşın</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
