'use client';
import { BookOpen, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export default function SEOContentBlock() {
  return (
    <div className="w-full my-12 bg-[var(--k-surface)] rounded-3xl border border-[var(--k-line)]/90 p-8 md:p-12 shadow-sm text-[var(--k-ink-2)] space-y-6">
      
      <div className="flex items-center gap-3 border-b border-[var(--k-line)] pb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--k-hot-wash)] text-[var(--k-hot)] flex items-center justify-center font-bold">
          <BookOpen size={20} />
        </div>
        <div>
          <h3 className="text-xl font-black text-[var(--k-ink)]">
            Sıfır ve Hatasız 2. El Cihaz Pazaryeri Rehberi
          </h3>
          <p className="text-xs text-[var(--k-ink-3)] font-medium">
            Sıfır ve 2. el teknoloji alışverişinde bilmeniz gereken tüm detaylar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed space-y-2 md:space-y-0">
        <div className="space-y-3">
          <h4 className="text-sm font-black text-[var(--k-ink)] flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-[var(--k-hot)]" />
            <span>Sıfır ve Hatasız 2. El Cihaz Standartlarımız</span>
          </h4>
          <p>
            Mytt platformunda yenilenmiş (refurbished) cihaz satışı yapılmaz; sadece %100 orijinal sıfır (kapalı kutu) veya kozmetik ve donanımsal olarak kusursuz hatasız 2. el telefonlar listelenir. Tüm cihazlar TSE belgeli ekspertiz merkezimizde 32 farklı teknik kontrol aşamasından geçirilerek onaylanır.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-black text-[var(--k-ink)] flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Escrow Havuz Hesabı Güvencesi</span>
          </h4>
          <p>
            Mytt platformunda yapılan alışverişlerde alıcının ödemesi Escrow havuz hesabında güvenle bloke edilir. Alıcı ürünü teslim alıp ekspertiz raporuyla doğrulamadan satıcıya ödeme aktarılmaz. Böylece %100 risk-free alışveriş sağlanır.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-black text-[var(--k-ink)] flex items-center gap-1.5">
            <Award size={16} className="text-blue-600" />
            <span>Cihazımı En Yüksek Fiyatık Nasıl Satarım?</span>
          </h4>
          <p>
            Cihaz modelinizi ve kozmetik durumunu sisteme girdiğinizde, 150+ onaylı yetkili bayi kapalı açık artırma tekliflerinde yarışır. En yüksek teklifi seçtiğinizde kuryemiz kapınızdan ücretsiz teslim alır ve paranız aynı gün hesabınıza aktarılır.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-black text-[var(--k-ink)] flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-[var(--k-hot)]" />
            <span>TSE 12 Ay Garanti Kapsamı</span>
          </h4>
          <p>
            Platformumuzdan satın alınan tüm cihazlar 12 ay boyunca kullanıcı hatası dışındaki tüm teknik arızalara karşı ücretsiz onarım ve birebir cihaz değişim garantisine sahiptir.
          </p>
        </div>
      </div>

    </div>
  );
}
