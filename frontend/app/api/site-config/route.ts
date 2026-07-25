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
    title: 'Cihazını Sat',
    description: 'Yüzlerce yetkili bayi cihazın için kapalı teklifte yarışır. En yüksek teklifi onayla, kargola, paranı al.',
    badgeText: '1 Saatte Teklif',
    tag: 'Ücretsiz',
    features: [
      'Bayiler birbirinin teklifini göremez',
      'Cihaz kargosuz teslim edilir',
      'Ödeme garanti ile yapılır',
    ],
    stat: '150+',
    statLabel: 'Aktif Bayi',
    ctaText: 'Başla',
  },
  {
    id: 'ai-finder',
    enabled: true,
    title: 'AI Telefon Bulucu',
    description: 'Bütçenizi ve kullanım alışkanlıklarınızı analiz edip size özel en iyi 3 cihazı anında listeleyelim.',
    badgeText: 'YZ Destekli',
    tag: 'Saniyeler içinde',
    features: [
      'Bütçe & ihtiyaç analizi yapılır',
      'Kişiye özel 3 cihaz önerilir',
      'Anlık fiyat karşılaştırması',
    ],
    stat: '3',
    statLabel: 'Kişisel Öneri',
    ctaText: 'Hemen Bul',
  },
  {
    id: 'trade-in',
    enabled: true,
    title: 'Trade-In Hesaplayıcı',
    description: 'Eski telefonunuzun güncel piyasa değerini öğrenin, yeni cihazınızı çok daha uygun fiyata alın.',
    badgeText: 'Anlık Fiyat',
    tag: 'Ücretsiz',
    features: [
      'Güncel piyasa fiyatı gösterilir',
      'Yeni cihazda doğrudan indirim',
      'Güvenli & hızlı takas işlemi',
    ],
    stat: '%40',
    statLabel: 'a kadar tasarruf',
    ctaText: 'Değerini Öğren',
  },
];

const DEFAULT_SETTINGS = {
  ticker: "🏆 Türkiye'nin En Güvenilir Doğrulanmış Cihaz Pazarı  |  🎉 Vade Farksız 9 Taksit İmkânı  |  ✅ 21 Nokta Kalite Kontrol  |  🚀 Aynı Gün Kargo  |  💎 TSE Onaylı Premium Cihazlar",
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

  const settings = config.settings as any;
  const needsMerge =
    !settings?.serviceBubbles ||
    !settings?.trustBar ||
    !settings?.categories ||
    !settings?.featureCards;

  if (needsMerge) {
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    const updated = await prisma.siteConfig.update({
      where: { id: 'singleton' },
      data: { settings: merged },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json(config);
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
