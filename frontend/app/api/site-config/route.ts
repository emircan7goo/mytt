/**
 * GET /api/site-config
 * Ana sayfa içerik ayarları (ticker, trustBar, kategori ikonları, promo
 * balonları, özellik kartları). Eksik alanlar varsayılanlarla doldurulur,
 * mevcut kayıt asla ezilmez.
 * (backend/src/site-config/site-config.service.ts'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

const DEFAULT_FEATURE_CARDS = [
  {
    id: 'sell',
    enabled: true,
    title: 'Cihazını Hemen Sat',
    description: 'Yetkili bayiler cihazın için 1 saat içinde kapalı tekliflerde yarışsın. En yüksek teklifi seç, ücretsiz kargola, paranı Escrow güvencesiyle anında al.',
    badgeText: 'Anında Kapalı Teklif',
    tag: 'Sıfır Komisyon',
    features: [
      'Şeffaf açık artırma teklifleri',
      'Ücretsiz kargo & kapıdan teslimat',
      '%100 Güvenli Escrow ödeme koruması',
    ],
    stat: '150+',
    statLabel: 'Onaylı Yetkili Bayi',
    ctaText: 'Teklif Al',
  },
  {
    id: 'ai-finder',
    enabled: true,
    title: 'Yapay Zekâ Akıllı Telefon Bulucu',
    description: 'Bütçenizi, kullanım alışkanlıklarınızı ve kamera/pil beklentilerinizi analiz edip size özel en uygun 3 ideal cihazı saniyeler içinde önerelim.',
    badgeText: 'YZ Akıllı Analiz',
    tag: 'Kişiye Özel',
    features: [
      'Kullanım profili analizi',
      'Fiyat / performans oranlaması',
      'Kişiselleştirilmiş 3 seçenek',
    ],
    stat: '3',
    statLabel: 'Size Özel Öneri',
    ctaText: 'Telefonumu Bul',
  },
  {
    id: 'trade-in',
    enabled: true,
    title: 'Eskiyi Getir, Yeniyi Al (Takas)',
    description: 'Eski telefonunuzun güncel piyasa değerini saniyeler içinde hesaplayın, yeni alacağınız cihazda doğrudan indirim avantajıyla hemen kullanın.',
    badgeText: 'Piyasa Değeri',
    tag: 'Anında İndirim',
    features: [
      'Canlı piyasa değerlemesi',
      'Cihaz fiyatından düşülen indirim',
      'Adresten hızlı değişim',
    ],
    stat: '%40',
    statLabel: 'Varan Takas İndirimi',
    ctaText: 'Değerini Hesapla',
  },
];

const DEFAULT_SETTINGS = {
  ticker: "🏆 Türkiye'nin En Güvenilir Doğrulanmış Cihaz Pazarı  |  🎉 Vade Farksız 12 Taksit İmkânı  |  ✅ 32 Nokta Kalite Kontrol  |  🚀 Aynı Gün Kargo  |  💎 TSE Onaylı Premium Cihazlar",
  trustBar: [
    { icon: 'ShieldCheck', title: '12 Ay Garanti', desc: "Tüm cihazlarda tam güvence." },
    { icon: 'Truck', title: 'Aynı Gün Kargo', desc: "Saat 14:00'e kadar olan siparişler." },
    { icon: 'Recycle', title: 'Eskiyi Getir', desc: 'En iyi takas değerini verelim.' },
  ],
  categories: [
    { name: 'Apple', icon: 'https://www.apple.com/ac/globalnav/7/tr_TR/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg' },
    { name: 'Samsung', icon: 'https://brand.samsung.com/content/dam/samsung/us/logo/Samsung_Wordmark_Black.svg' },
    { name: 'Xiaomi', icon: null },
    { name: 'Tabletler', icon: null },
    { name: 'Aksesuarlar', icon: null },
  ],
  serviceBubbles: [
    { id: 1, title1: 'Vade Farksız', title2: '9 Taksit!', iconUrl: '', link: '/?promo=taksit', bg: 'indigo' },
    { id: 2, title1: 'İndirimli Paket', title2: 'Ürünler!', iconUrl: '', link: '/?promo=paket', bg: 'rose' },
    { id: 3, title1: 'Sıfır', title2: 'Telefonlar', iconUrl: '', link: '/?cat=S%C4%B1f%C4%B1r', bg: 'emerald' },
    { id: 4, title1: 'Kaçmaz', title2: 'Fiyatlar!', iconUrl: '', link: '/?promo=kampanya', bg: 'amber' },
    { id: 5, title1: 'Akıllı', title2: 'Eşleştirme', iconUrl: '', link: '/secim-asistani', bg: 'sky' },
    { id: 6, title1: 'Mytt', title2: 'Güvencesi', iconUrl: '', link: '/garanti', bg: 'violet' },
    { id: 7, title1: 'Mağazadan', title2: 'Teslim Al', iconUrl: '', link: '/magazalar', bg: 'fuchsia' },
    { id: 8, title1: 'Sıkça Sorulan', title2: 'Sorular', iconUrl: '', link: '/yardim', bg: 'teal' },
  ],
  featureCards: DEFAULT_FEATURE_CARDS,
};

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });

  if (!config) {
    const created = await prisma.siteConfig.create({
      data: { id: 'singleton', settings: DEFAULT_SETTINGS },
    });
    return NextResponse.json(created);
  }

  // Daima güncel featureCards'ı garanti et
  const settings = { ...DEFAULT_SETTINGS, ...(config.settings as any), featureCards: DEFAULT_FEATURE_CARDS };
  return NextResponse.json({ ...config, settings });
}

export async function PATCH(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const settings = await req.json().catch(() => null);
  if (!settings) return NextResponse.json({ message: 'Geçersiz istek gövdesi.' }, { status: 400 });

  const updated = await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', settings },
    update: { settings },
  });

  return NextResponse.json(updated);
}
