import Link from 'next/link';

export default function GizlilikPage() {
  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-[var(--k-surface)] p-8 md:p-12 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-6">

        <h1 className="text-3xl font-black text-[var(--k-ink)] border-b border-[var(--k-line)] pb-4">
          Gizlilik ve Kişisel Verileri Koruma Politikası
        </h1>

        <div className="space-y-4 text-sm text-[var(--k-ink-2)] font-medium leading-relaxed">
          <p>
            Mytt Teknoloji Anonim Şirketi ("Mytt") olarak, kullanıcılarımızın kişisel verilerinin korunması ve gizliliğinin sağlanması öncelikli ilkemizdir.
          </p>

          <h3 className="text-base font-black text-[var(--k-ink)] pt-2">1. Veri Sorumlusu</h3>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Mytt tarafından işlenmektedir.
          </p>

          <h3 className="text-base font-black text-[var(--k-ink)] pt-2">2. İşlenen Kişisel Veriler ve Amacı</h3>
          <p>
            Platformumuzda sunulan hizmetlerden yararlanabilmeniz amacıyla ad, soyad, e-posta, telefon numarası, teslimat adresi ve ödeme bilgileri 6698 sayılı Kanun'a uygun olarak işlenmektedir.
          </p>

          <h3 className="text-base font-black text-[var(--k-ink)] pt-2">3. Veri Güvenliği ve Escrow Koruması</h3>
          <p>
            Tüm veri iletimi 256-bit SSL şifreleme protokolü ile korunmakta olup, ödeme ve kimlik bilgileriniz kesinlikle yetkisiz üçüncü şahıslarla paylaşılmamaktadır.
          </p>

          <h3 className="text-base font-black text-[var(--k-ink)] pt-2">4. İletişim</h3>
          <p>
            Gizlilik politikamız hakkındaki tüm soru ve KVKK talepleriniz için <Link href="/iletisim" className="text-orange-600 font-bold underline">destek@mytt.com.tr</Link> adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>

      </div>
    </div>
  );
}
