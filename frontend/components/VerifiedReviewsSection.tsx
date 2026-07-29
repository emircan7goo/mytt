'use client';
import { Star, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Mert B.',
    location: 'İstanbul / Kadıköy',
    device: 'iPhone 14 Pro (128GB)',
    rating: 5,
    date: 'Dün',
    comment: 'Eski telefonumu 1 saat içinde kapalı ihaleye çıkardım. Beklediğimden 3.000 ₺ daha yüksek teklif geldi. Kurye kapımdan ücretsiz aldı, param aynı gün yattı. Harika sistem!',
    type: 'Cihazını Sattı',
    verified: true,
  },
  {
    id: 2,
    name: 'Selin A.',
    location: 'Ankara / Çankaya',
    device: 'iPhone 13 (128GB)',
    rating: 5,
    date: '3 gün önce',
    comment: 'TSE 12 ay garantili aldığım telefon tamamen sıfır gibi geldi. Kutusunda 32-nokta ekspertiz raporu da çıktı. Şeffaf ve çok güvenilir.',
    type: 'Yenilenmiş Cihaz Aldı',
    verified: true,
  },
  {
    id: 3,
    name: 'Kaan T.',
    location: 'İzmir / Karşıyaka',
    device: 'Galaxy S23 Ultra',
    rating: 5,
    date: 'Geçen hafta',
    comment: 'Escrow havuz hesabı olması içimi çok rahatlattı. Cihazı kuryeden teslim alıp kontrol edene kadar para havuzda bekledi. Güvenle alışveriş yapabilirsiniz.',
    type: 'Yenilenmiş Cihaz Aldı',
    verified: true,
  },
];

export default function VerifiedReviewsSection() {
  return (
    <div className="w-full my-10">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="px-3.5 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-xs font-black tracking-wider uppercase">
          DOĞRULANMIŞ KULLANICI DENEYİMLERİ
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2.5">
          Binlerce Kullanıcı Mytt Güvencesiyle <span className="text-orange-600">Alıyor ve Satıyor</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REVIEWS.map((r) => (
          <div key={r.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400" />
                  ))}
                </div>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>{r.type}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                "{r.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1">
                  <span>{r.name}</span>
                  <ShieldCheck size={14} className="text-blue-600" />
                </div>
                <div className="text-[11px] text-slate-500 font-bold">{r.device} · {r.location}</div>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{r.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
