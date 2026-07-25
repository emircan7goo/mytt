import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Mytt',
  description: 'Mytt platformu kullanım koşulları ve hizmet sözleşmesi.',
  robots: { index: true, follow: true },
};

export default function KullanimKosullariPage() {
  return (
    <main className="min-h-screen bg-[var(--k-canvas)] pt-[100px] pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[var(--k-ink)] mb-2 tracking-tight">
          Kullanım Koşulları
        </h1>
        <p className="text-[var(--k-ink-4)] text-sm mb-10">
          Platformumuzu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
        </p>

        <div className="prose prose-zinc max-w-none space-y-8 text-[var(--k-ink-2)] text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">1. Hizmetin Kapsamı</h2>
            <p>
              Mytt, yenilenmiş ve ikinci el akıllı telefon alım-satımına aracılık eden çevrimiçi
              bir pazar yeridir. Platform; alıcıları onaylı bayilerle buluşturur, alışveriş güvencesi
              hizmeti sunar ve ürün teslimatı sonrası ödemeyi bayiye aktarır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">2. Kullanıcı Hesabı</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Hesap açmak için 18 yaşını doldurmuş olmanız gerekmektedir.</li>
              <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz.</li>
              <li>Başkası adına hesap açmak, hesabınızı devretmek veya paylaşmak yasaktır.</li>
              <li>Yanlış veya yanıltıcı bilgi verilmesi hesabın kapatılmasına neden olabilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">3. Ödeme ve Güvence</h2>
            <p>
              Ödemeler PayTR altyapısı üzerinden güvenli şekilde gerçekleştirilir. Ödeme başarıyla
              tamamlandığında tutar alışveriş güvencemiz kapsamına alınır; ürün teslim onaylandıktan sonra bayiye
              aktarılır. İade süreçlerinde Mytt arabulucu sıfatıyla hareket eder.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">4. Bayi Yükümlülükleri</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ürün bilgileri doğru ve eksiksiz girilmelidir.</li>
              <li>İlan edilen koşul (A+, A, B grade) gerçekle örtüşmelidir.</li>
              <li>Sipariş alındıktan sonra ürün 3 iş günü içinde kargoya verilmelidir.</li>
              <li>Sahte IMEI veya çalıntı cihaz listelenemez; tespit halinde hesap kalıcı olarak kapatılır ve yasal işlem başlatılır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">5. Yasaklı Faaliyetler</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Platformu otomatik araçlarla (bot, scraper) taramak</li>
              <li>Diğer kullanıcıların verilerine yetkisiz erişim sağlamak</li>
              <li>Sahte sipariş veya ödeme girişiminde bulunmak</li>
              <li>Platform altyapısına zarar vermeye çalışmak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">6. Fikri Mülkiyet</h2>
            <p>
              Mytt adı, logosu, tasarımı ve platform kodları telif hakkıyla korunmaktadır.
              İzinsiz kopyalama, dağıtma veya değiştirme yasaktır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibent text-[var(--k-ink)] mb-3">7. Sorumluluk Sınırlaması</h2>
            <p>
              Mytt bir pazar yeri işletmecisidir; alıcı ile bayi arasındaki sözleşmenin tarafı
              değildir. Ürünün fiziksel durumu, taşıma hasarları veya teslimat gecikmeleri
              konusundaki birincil sorumluluk bayiye aittir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">8. Hesap Askıya Alma ve Kapatma</h2>
            <p>
              Mytt, bu koşulları ihlal eden hesapları önceden bildirim yapmaksızın askıya alma
              veya kapatma hakkını saklı tutar. Bayi hesabı kapatılması halinde güvence altındaki
              tutarlar inceleme sonrası ilgili tarafa iade edilir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">9. Uygulanacak Hukuk</h2>
            <p>
              Bu sözleşme Türk hukukuna tabidir. Uyuşmazlıklarda İstanbul Merkez Mahkemeleri
              ve İcra Daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">10. Değişiklikler</h2>
            <p>
              Mytt bu koşulları önceden bildirmeksizin güncelleme hakkını saklı tutar.
              Güncellemeler yayımlandığı tarihten itibaren geçerlidir. Platformu kullanmaya
              devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          <p className="text-[var(--k-ink-4)] text-xs pt-6 border-t border-[var(--k-line)]">
            Son güncelleme: Nisan 2025
          </p>
        </div>
      </div>
    </main>
  );
}
