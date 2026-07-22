import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('ğŸ”„ Seeding SUPER APP database with Premium Stores...');

  // FK ordering — child tables before parents
  await prisma.activityLog?.deleteMany().catch(() => {});
  await prisma.stockRequest?.deleteMany().catch(() => {});
  await (prisma as any).wishlist?.deleteMany().catch(() => {});
  await (prisma as any).sellRequestBid?.deleteMany().catch(() => {});
  await (prisma as any).sellRequest?.deleteMany().catch(() => {});
  await (prisma as any).dealerMarketBid?.deleteMany().catch(() => {});
  await (prisma as any).dealerMarketItem?.deleteMany().catch(() => {});
  await (prisma as any).ticket?.deleteMany().catch(() => {});
  await prisma.dealerStock?.deleteMany().catch(() => {});
  await prisma.order?.deleteMany().catch(() => {});
  await prisma.product?.deleteMany().catch(() => {});
  await prisma.dealerApplication?.deleteMany().catch(() => {});
  await prisma.globalProduct?.deleteMany().catch(() => {});
  await (prisma as any).heroSlide?.deleteMany().catch(() => {});
  await (prisma as any).siteConfig?.deleteMany().catch(() => {});
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // ── Demo Hesaplar (frontend lib/auth.ts ile uyumlu) ─────────────────────────
  const adminHash    = await bcrypt.hash('admin123',   10);
  const dealerHash   = await bcrypt.hash('bayi123',    10);
  const customerHash = await bcrypt.hash('musteri123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      name: 'System Admin',
      password: adminHash,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const demoDealer = await prisma.user.create({
    data: {
      email: 'bayi@demo.com',
      name: 'Ahmet Bayi',
      password: dealerHash,
      role: 'DEALER',
      isActive: true,
      b2bStatus: 'APPROVED',
      companyName: 'Demo Bayi A.Ş.',
      taxId: '1234567890',
      commissionRate: 0.08,
    },
  });

  await prisma.user.create({
    data: {
      email: 'musteri@demo.com',
      name: 'Ali Demir',
      password: customerHash,
      role: 'CUSTOMER',
      isActive: true,
    },
  });

  console.log('✅ Demo hesaplar: admin@demo.com / bayi@demo.com / musteri@demo.com');

  // Demo dealer'a mağaza oluştur (DealerStock için gerekli)
  const demoDealerStore = await prisma.store.create({
    data: {
      ownerId: demoDealer.id,
      name: 'Demo Bayi MaÄŸazasÄ±',
      logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=150&h=150&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=300&fit=crop&q=80',
      bio: 'Kaliteli ikinci el iPhone ve Samsung cihazlarda güvenilir adresiniz. Tüm cihazlar test edilmiş ve sertifikalandırılmıştır.',
      rating: 4.7,
      reviewCount: 32,
      jobsCompleted: 87,
      isPremium: false,
      categories: ['Cihaz AlÄ±m/SatÄ±m'],
      detailedServices: { 'Cihaz AlÄ±m/SatÄ±m': ['iPhone', 'Samsung', 'Xiaomi'] },
      reviews: [
        { user: 'Ahmet K.', rating: 5, comment: 'Harika hizmet, cihaz sorunsuz geldi.' },
        { user: 'Zeynep M.', rating: 4, comment: 'Hızlı kargo, açıklamayla uygun ürün.' },
      ],
    },
  });

  const owners: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const owner = await prisma.user.create({
      data: {
        email: `owner${i}@mytt.com`,
        password: passwordHash,
        role: 'DEALER',
      },
    });
    owners.push(owner);
  }

  const storesData = [
    {
      name: 'Çelik İletişim',
      logo: 'https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?w=150&h=150&fit=crop&crop=faces&q=80',
      coverImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=300&fit=crop&q=80',
      bio: 'Apple ve Android cihazlarda 10 yıllık tamir tecrübesi. Güvenilir ve hızlı çözüm.',
      rating: 4.9,
      reviewCount: 128,
      jobsCompleted: 350,
      isPremium: true,
      categories: ['Tamir', 'Aksesuar'],
      detailedServices: {
        "Tamir": ["Ekran Değişimi", "Batarya Değişimi", "Kasa Onarımı", "Kamera Değişimi"],
        "Aksesuar": ["Kırılmaz Cam", "Orijinal Şarj Aleti", "AirPods Kılıfı"]
      },
      reviews: [
        { user: 'Ahmet Y.', rating: 5, comment: 'Ekranı 1 saatte orijinaliyle değiştirdiler, helal olsun.' },
        { user: 'Büşra K.', rating: 5, comment: 'Güler yüzlü esnaf, bataryam artık 2 gün gidiyor!' },
        { user: 'Can D.', rating: 4, comment: 'HÄ±zlÄ± onarÄ±m ama biraz sÄ±ra bekledim, tavsiye ederim.' }
      ]
    },
    {
      name: 'TeknoFix Çayırova',
      logo: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=150&h=150&fit=crop&crop=faces&q=80',
      coverImage: 'https://images.unsplash.com/photo-1582046467027-1aa3dcfa7166?w=800&h=300&fit=crop&q=80',
      bio: 'En uygun fiyatlı yazılım ve tamir çözümleri. Garantili teknik servis.',
      rating: 4.8,
      reviewCount: 95,
      jobsCompleted: 210,
      isPremium: true,
      categories: ['YazÄ±lÄ±m', 'Tamir', 'Cihaz AlÄ±m/SatÄ±m'],
      detailedServices: {
        "Yazılım": ["Şebeke Onarımı", "IMEI İşlemleri", "Sistem Geri Yükleme", "Virüs Temizliği"],
        "Tamir": ["Anakart Tamiri", "Sıvı Teması Çözümleri"],
        "Cihaz AlÄ±m/SatÄ±m": ["Ä°kinci El AlÄ±m", "Takas DesteÄŸi"]
      },
      reviews: [
        { user: 'Murat T.', rating: 5, comment: 'Yazılım çökmüştü, 2 saatte verilerimi kurtarıp cihazı açtılar. Müthişler!' },
        { user: 'Leyla S.', rating: 5, comment: 'İkinci el iPhone aldım, sıfır gibi. Güvenle alışveriş yapabilirsiniz.' }
      ]
    },
    {
      name: 'Pro Mobile Servis',
      logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=300&fit=crop&q=80',
      bio: 'Anakart onarımında bölgenin en iyisi. 6 ay yedek parça garantisi.',
      rating: 5.0,
      reviewCount: 340,
      jobsCompleted: 890,
      isPremium: true,
      categories: ['Tamir', 'Cihaz AlÄ±m/SatÄ±m'],
      detailedServices: {
        "Tamir": ["Mikroskobik Anakart Onarımı", "Entegre Değişimi", "Face ID Tamiri"],
        "Cihaz Alım/Satım": ["Sıfır Cihaz Satışı", "Garantili 2. El Dağıtımı"]
      },
      reviews: [
        { user: 'Selin Ç.', rating: 5, comment: 'Face ID bozuktu Apple 10 bin TL istedi, burada üçte bir fiyatına orijinal yaptırdım.' },
        { user: 'Osman K.', rating: 5, comment: 'Kesinlikle bölgenin en profesyonel tamircisi.' },
        { user: 'Ayşe B.', rating: 5, comment: 'Ustalıkları gerçekten Awwwards seviyesinde!' }
      ]
    },
    {
      name: 'Sıla İletişim',
      logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80',
      coverImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=300&fit=crop&q=80',
      bio: 'Güleryüzlü hizmet, anında aksesuar ve tamir. Çayırova Merkezde hizmetinizdeyiz.',
      rating: 4.7,
      reviewCount: 45,
      jobsCompleted: 120,
      isPremium: true,
      categories: ['Aksesuar', 'Tamir'],
      detailedServices: {
        "Aksesuar": ["Magsafe Kılıflar", "Giriş Seviye Şarjlar", "Bluetooth Kulaklıklar"],
        "Tamir": ["Ekran Koruyucu Uygulama", "Şarj Soketi Onarımı", "Hoparlör Temizliği"]
      },
      reviews: [
        { user: 'Demir T.', rating: 4, comment: 'Kılıf çeşitliliği çok iyi ancak biraz daha model olabilir.' },
        { user: 'Cansu P.', rating: 5, comment: 'Şarj soketim bozuk zannediyordum, meğer tozlanmış. Ücretsiz temizlediler, çok dürüstler.' }
      ]
    },
    {
      name: 'VIP Elektronik',
      logo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=faces&q=80',
      coverImage: 'https://images.unsplash.com/photo-1550005973-54089b1db4ce?w=800&h=300&fit=crop&q=80',
      bio: 'Sadece cep telefonu deÄŸil, tablet onarÄ±mÄ± da yapÄ±yoruz. Apple Store kalitesinde VIP hizmet.',
      rating: 4.9,
      reviewCount: 215,
      jobsCompleted: 600,
      isPremium: true,
      categories: ['Tamir', 'YazÄ±lÄ±m', 'Aksesuar'],
      detailedServices: {
        "Tamir": ["Tablet Ekran Değişimi", "iPad Batarya Onarımı", "Gövde Düzeltme"],
        "Yazılım": ["Bootloop Çözümleri", "Veri Kurtarma Merkezleri"],
        "Aksesuar": ["Orijinal Apple Aksesuarları", "Lisanslı Şarj Aletleri"]
      },
      reviews: [
        { user: 'Mustafa D.', rating: 5, comment: 'Yamulan iPad kasamı inanılmaz bir şekilde düzelttiler.' },
        { user: 'Furkan O.', rating: 5, comment: 'VIP ismi gerçekten hak ediliyor. Hizmet kalitesi Apple Store tadında.' }
      ]
    }
  ];

  for (let i = 0; i < 5; i++) {
    const s = storesData[i];
    
    await prisma.store.create({
      data: {
        ownerId: owners[i].id,
        name: s.name,
        logo: s.logo,
        coverImage: s.coverImage,
        bio: s.bio,
        rating: s.rating,
        reviewCount: s.reviewCount,
        jobsCompleted: s.jobsCompleted,
        isPremium: s.isPremium,
        categories: s.categories,
        detailedServices: s.detailedServices,
        reviews: s.reviews
      },
    });
    
    // Add PostGIS location
    const lat = 40.82 + (Math.random() - 0.5) * 0.02; 
    const lng = 29.37 + (Math.random() - 0.5) * 0.02;
    await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE id = '${owners[i].id}'
    `);
  }

  // ── Ürünleri oluştur ──────────────────────────────────────────────────────
  const stores = await prisma.store.findMany({ select: { id: true } });

  const products = [
    // Çelik İletişim (stores[0])
    { storeId: stores[0].id, brand: 'Apple', model: 'iPhone 15 Pro', condition: 'NEW' as const, price: 54999, stock: 3, isSponsored: true, priority: 10, imagesUrl: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '256GB', color: 'DoÄŸal Titanyum', ram: '8GB', cosmeticGrade: 'A', batteryHealth: 100 } },
    { storeId: stores[0].id, brand: 'Apple', model: 'iPhone 14', condition: 'SECOND_HAND' as const, price: 28500, stock: 2, isSponsored: false, priority: 5, isOnCampaign: true, campaignTag: 'FÄ±rsat', discountedPrice: 25999, imagesUrl: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '128GB', color: 'Gece YarÄ±sÄ±', ram: '6GB', cosmeticGrade: 'A', batteryHealth: 89 } },
    // TeknoFix (stores[1])
    { storeId: stores[1].id, brand: 'Samsung', model: 'Galaxy S24 Ultra', condition: 'NEW' as const, price: 62999, stock: 5, isSponsored: true, priority: 9, imagesUrl: ['https://images.unsplash.com/photo-1705076117936-b893b7931977?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '256GB', color: 'Titanium Black', ram: '12GB', cosmeticGrade: 'A', batteryHealth: 100 } },
    { storeId: stores[1].id, brand: 'Samsung', model: 'Galaxy S23', condition: 'SECOND_HAND' as const, price: 24999, stock: 4, isSponsored: false, priority: 4, imagesUrl: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '256GB', color: 'Lavanta', ram: '8GB', cosmeticGrade: 'B', batteryHealth: 84 } },
    // Pro Mobile (stores[2])
    { storeId: stores[2].id, brand: 'Apple', model: 'iPhone 15', condition: 'NEW' as const, price: 44999, stock: 6, isSponsored: false, priority: 7, imagesUrl: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '128GB', color: 'Pembe', ram: '6GB', cosmeticGrade: 'A', batteryHealth: 100 } },
    { storeId: stores[2].id, brand: 'Apple', model: 'iPhone 13 Pro Max', condition: 'SECOND_HAND' as const, price: 32999, stock: 1, isSponsored: false, priority: 3, isOnCampaign: true, campaignTag: 'Son Şans', discountedPrice: 29999, imagesUrl: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '256GB', color: 'Altın', ram: '6GB', cosmeticGrade: 'A', batteryHealth: 91 } },
    // Sıla İletişim (stores[3])
    { storeId: stores[3].id, brand: 'Xiaomi', model: '14 Ultra', condition: 'NEW' as const, price: 42999, stock: 3, isSponsored: false, priority: 6, imagesUrl: ['https://i01.appmifile.com/webfile/globalimg/products/pc/xiaomi-14-ultra/key-features-1.jpg'], specsJson: { storage: '512GB', color: 'Siyah', ram: '16GB', cosmeticGrade: 'A', batteryHealth: 100 } },
    { storeId: stores[3].id, brand: 'Samsung', model: 'Galaxy A55', condition: 'NEW' as const, price: 18999, stock: 8, isSponsored: false, priority: 2, imagesUrl: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '128GB', color: 'Çiçek Leylak', ram: '8GB', cosmeticGrade: 'A', batteryHealth: 100 } },
    // VIP Elektronik (stores[4])
    { storeId: stores[4].id, brand: 'Apple', model: 'iPhone 15 Pro Max', condition: 'NEW' as const, price: 64999, stock: 2, isSponsored: true, priority: 10, imagesUrl: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=900&fit=crop&q=80'], specsJson: { storage: '256GB', color: 'DoÄŸal Titanyum', ram: '8GB', cosmeticGrade: 'A', batteryHealth: 100 } },
    { storeId: stores[4].id, brand: 'Google', model: 'Pixel 9 Pro', condition: 'NEW' as const, price: 38999, stock: 4, isSponsored: false, priority: 5, isOnCampaign: true, campaignTag: 'Yeni Sezon', discountedPrice: 35999, imagesUrl: ['https://lh3.googleusercontent.com/jVcnNQnHTKIKFqkXA1wLVPZfXNWA3f9cqhbMhAWZaTrxHmVfKG1VyWKqHJDFLcJHLZYQ'], specsJson: { storage: '256GB', color: 'Obsidiyen', ram: '16GB', cosmeticGrade: 'A', batteryHealth: 100 } },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log(`✅ ${products.length} ürün eklendi.`);

  // ── Global Katalog (GlobalProduct) ──────────────────────────────────────────
  console.log('\nğŸŒ± Global katalog ekleniyor...');

  // Yardımcı: brand + model + storage kombinasyonları üretir
  function variants(brand: string, model: string, storages: string[]) {
    return storages.map(storage => ({ brand, model, storage, color: null as string | null, isActive: true }));
  }

  const catalogData = [
    // ── Apple iPhone (X → 17 Pro Max) ────────────────────────────────────────
    ...variants('Apple', 'iPhone X',          ['64GB', '256GB']),
    ...variants('Apple', 'iPhone XS',         ['64GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone XS Max',     ['64GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone XR',         ['64GB', '128GB', '256GB']),
    ...variants('Apple', 'iPhone 11',         ['64GB', '128GB', '256GB']),
    ...variants('Apple', 'iPhone 11 Pro',     ['64GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 11 Pro Max', ['64GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 12',         ['64GB', '128GB', '256GB']),
    ...variants('Apple', 'iPhone 12 mini',    ['64GB', '128GB', '256GB']),
    ...variants('Apple', 'iPhone 12 Pro',     ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 12 Pro Max', ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 13',         ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 13 mini',    ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 13 Pro',     ['128GB', '256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 13 Pro Max', ['128GB', '256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 14',         ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 14 Plus',    ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 14 Pro',     ['128GB', '256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 14 Pro Max', ['128GB', '256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 15',         ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 15 Plus',    ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 15 Pro',     ['256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 15 Pro Max', ['256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 16',         ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 16 Plus',    ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 16 Pro',     ['256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 16 Pro Max', ['256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 17',         ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 17 Plus',    ['128GB', '256GB', '512GB']),
    ...variants('Apple', 'iPhone 17 Pro',     ['256GB', '512GB', '1TB']),
    ...variants('Apple', 'iPhone 17 Pro Max', ['256GB', '512GB', '1TB']),
    // ── Samsung ───────────────────────────────────────────────────────────────
    // Galaxy S serisi
    ...variants('Samsung', 'Galaxy S23',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy S23+',        ['256GB', '512GB']),
    ...variants('Samsung', 'Galaxy S23 Ultra',   ['256GB', '512GB', '1TB']),
    ...variants('Samsung', 'Galaxy S23 FE',      ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy S24',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy S24+',        ['256GB', '512GB']),
    ...variants('Samsung', 'Galaxy S24 Ultra',   ['256GB', '512GB', '1TB']),
    ...variants('Samsung', 'Galaxy S24 FE',      ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy S25',         ['128GB', '256GB', '512GB']),
    ...variants('Samsung', 'Galaxy S25+',        ['256GB', '512GB']),
    ...variants('Samsung', 'Galaxy S25 Ultra',   ['256GB', '512GB', '1TB']),
    // Galaxy A serisi
    ...variants('Samsung', 'Galaxy A05',         ['64GB', '128GB']),
    ...variants('Samsung', 'Galaxy A05s',        ['64GB', '128GB']),
    ...variants('Samsung', 'Galaxy A15',         ['128GB']),
    ...variants('Samsung', 'Galaxy A15 5G',      ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A16',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A16 5G',      ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A25',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A35',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A36',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A54',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A55',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy A56',         ['128GB', '256GB']),
    // Galaxy Z serisi (katlanabilir)
    ...variants('Samsung', 'Galaxy Z Fold 5',    ['256GB', '512GB', '1TB']),
    ...variants('Samsung', 'Galaxy Z Fold 6',    ['256GB', '512GB', '1TB']),
    ...variants('Samsung', 'Galaxy Z Flip 5',    ['256GB', '512GB']),
    ...variants('Samsung', 'Galaxy Z Flip 6',    ['256GB', '512GB']),
    // Galaxy M serisi
    ...variants('Samsung', 'Galaxy M15',         ['128GB']),
    ...variants('Samsung', 'Galaxy M35',         ['128GB', '256GB']),
    ...variants('Samsung', 'Galaxy M55',         ['128GB', '256GB']),
    // ── Xiaomi (ana seri) ─────────────────────────────────────────────────────
    ...variants('Xiaomi', 'Xiaomi 12',        ['128GB', '256GB']),
    ...variants('Xiaomi', 'Xiaomi 12 Pro',    ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 13',        ['128GB', '256GB']),
    ...variants('Xiaomi', 'Xiaomi 13 Pro',    ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 13 Lite',   ['128GB', '256GB']),
    ...variants('Xiaomi', 'Xiaomi 13T',       ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 13T Pro',   ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 14',        ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 14 Pro',    ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 14 Ultra',  ['256GB', '512GB', '1TB']),
    ...variants('Xiaomi', 'Xiaomi 14T',       ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 14T Pro',   ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 15',        ['256GB', '512GB']),
    ...variants('Xiaomi', 'Xiaomi 15 Pro',    ['256GB', '512GB', '1TB']),
    ...variants('Xiaomi', 'Xiaomi 15 Ultra',  ['512GB', '1TB']),
    // ── Redmi ─────────────────────────────────────────────────────────────────
    ...variants('Redmi', 'Redmi 12',               ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi 12C',              ['64GB', '128GB']),
    ...variants('Redmi', 'Redmi 13',               ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi 13C',              ['64GB', '128GB', '256GB']),
    ...variants('Redmi', 'Redmi A3',               ['64GB', '128GB']),
    ...variants('Redmi', 'Redmi A3x',              ['64GB', '128GB']),
    ...variants('Redmi', 'Redmi Note 12',          ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi Note 12 Pro',      ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi Note 12 Pro+',     ['256GB', '512GB']),
    ...variants('Redmi', 'Redmi Note 12S',         ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi Note 12 Turbo',    ['256GB', '512GB']),
    ...variants('Redmi', 'Redmi Note 13',          ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi Note 13 Pro',      ['256GB', '512GB']),
    ...variants('Redmi', 'Redmi Note 13 Pro+',     ['256GB', '512GB']),
    ...variants('Redmi', 'Redmi Note 13 4G',       ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi Note 14',          ['128GB', '256GB']),
    ...variants('Redmi', 'Redmi Note 14 Pro',      ['256GB', '512GB']),
    ...variants('Redmi', 'Redmi Note 14 Pro+',     ['256GB', '512GB']),
    ...variants('Redmi', 'Redmi Note 14 4G',       ['128GB', '256GB']),
    // ── POCO ──────────────────────────────────────────────────────────────────
    ...variants('POCO', 'POCO X5',       ['128GB', '256GB']),
    ...variants('POCO', 'POCO X5 Pro',   ['128GB', '256GB']),
    ...variants('POCO', 'POCO X6',       ['256GB', '512GB']),
    ...variants('POCO', 'POCO X6 Pro',   ['256GB', '512GB']),
    ...variants('POCO', 'POCO X6 Neo',   ['256GB']),
    ...variants('POCO', 'POCO X7',       ['256GB', '512GB']),
    ...variants('POCO', 'POCO X7 Pro',   ['256GB', '512GB']),
    ...variants('POCO', 'POCO F5',       ['128GB', '256GB']),
    ...variants('POCO', 'POCO F5 Pro',   ['256GB', '512GB']),
    ...variants('POCO', 'POCO F6',       ['256GB', '512GB']),
    ...variants('POCO', 'POCO F6 Pro',   ['256GB', '512GB']),
    ...variants('POCO', 'POCO M6',       ['128GB', '256GB']),
    ...variants('POCO', 'POCO M6 Pro',   ['128GB', '256GB']),
    ...variants('POCO', 'POCO M6 Plus',  ['128GB', '256GB']),
    ...variants('POCO', 'POCO C65',      ['128GB', '256GB']),
    ...variants('POCO', 'POCO C75',      ['128GB', '256GB']),
    // ── Huawei ────────────────────────────────────────────────────────────────
    ...variants('Huawei', 'Huawei P50',           ['128GB', '256GB']),
    ...variants('Huawei', 'Huawei P50 Pro',       ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei P60',           ['128GB', '256GB']),
    ...variants('Huawei', 'Huawei P60 Pro',       ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei P60 Art',       ['512GB', '1TB']),
    ...variants('Huawei', 'Huawei Pura 70',       ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei Pura 70 Pro',   ['256GB', '512GB', '1TB']),
    ...variants('Huawei', 'Huawei Pura 70 Ultra', ['512GB', '1TB']),
    ...variants('Huawei', 'Huawei Mate 50',       ['128GB', '256GB']),
    ...variants('Huawei', 'Huawei Mate 50 Pro',   ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei Mate 60',       ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei Mate 60 Pro',   ['256GB', '512GB', '1TB']),
    ...variants('Huawei', 'Huawei Mate X5',       ['512GB', '1TB']),
    ...variants('Huawei', 'Huawei nova 11',       ['128GB', '256GB']),
    ...variants('Huawei', 'Huawei nova 11 Pro',   ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei nova 12',       ['128GB', '256GB']),
    ...variants('Huawei', 'Huawei nova 12 Pro',   ['256GB', '512GB']),
    ...variants('Huawei', 'Huawei nova 12 SE',    ['128GB', '256GB']),
    ...variants('Huawei', 'Huawei nova 13',       ['256GB']),
    // ── Vivo ──────────────────────────────────────────────────────────────────
    ...variants('Vivo', 'Vivo X90',        ['256GB']),
    ...variants('Vivo', 'Vivo X90 Pro',    ['256GB', '512GB']),
    ...variants('Vivo', 'Vivo X100',       ['256GB', '512GB']),
    ...variants('Vivo', 'Vivo X100 Pro',   ['256GB', '512GB', '1TB']),
    ...variants('Vivo', 'Vivo X200',       ['256GB', '512GB']),
    ...variants('Vivo', 'Vivo X200 Pro',   ['256GB', '512GB', '1TB']),
    ...variants('Vivo', 'Vivo V29',        ['256GB']),
    ...variants('Vivo', 'Vivo V29 Pro',    ['256GB']),
    ...variants('Vivo', 'Vivo V30',        ['128GB', '256GB']),
    ...variants('Vivo', 'Vivo V30 Pro',    ['256GB', '512GB']),
    ...variants('Vivo', 'Vivo V40',        ['256GB', '512GB']),
    ...variants('Vivo', 'Vivo V40 Pro',    ['256GB', '512GB']),
    ...variants('Vivo', 'Vivo V40 Lite',   ['128GB', '256GB']),
    ...variants('Vivo', 'Vivo Y200',       ['128GB', '256GB']),
    ...variants('Vivo', 'Vivo Y200 Pro',   ['256GB']),
    ...variants('Vivo', 'Vivo Y38',        ['128GB', '256GB']),
    ...variants('Vivo', 'Vivo Y28',        ['128GB', '256GB']),
    ...variants('Vivo', 'Vivo Y18',        ['128GB']),
    // ── Tecno ─────────────────────────────────────────────────────────────────
    ...variants('Tecno', 'Tecno Camon 20',         ['256GB']),
    ...variants('Tecno', 'Tecno Camon 20 Pro',     ['256GB', '512GB']),
    ...variants('Tecno', 'Tecno Camon 20 Premier', ['512GB']),
    ...variants('Tecno', 'Tecno Camon 30',         ['256GB', '512GB']),
    ...variants('Tecno', 'Tecno Camon 30 Pro',     ['256GB', '512GB']),
    ...variants('Tecno', 'Tecno Phantom X2',       ['256GB', '512GB']),
    ...variants('Tecno', 'Tecno Phantom X2 Pro',   ['256GB', '512GB']),
    ...variants('Tecno', 'Tecno Phantom V Fold',   ['512GB']),
    ...variants('Tecno', 'Tecno Spark 20',         ['128GB', '256GB']),
    ...variants('Tecno', 'Tecno Spark 20 Pro',     ['128GB', '256GB']),
    ...variants('Tecno', 'Tecno Spark 20 Pro+',    ['256GB']),
    ...variants('Tecno', 'Tecno Spark 30',         ['128GB', '256GB']),
    ...variants('Tecno', 'Tecno Pova 6',           ['128GB', '256GB']),
    ...variants('Tecno', 'Tecno Pova 6 Pro',       ['256GB']),
    ...variants('Tecno', 'Tecno Pop 8',            ['64GB', '128GB']),
    ...variants('Tecno', 'Tecno Pop 9',            ['128GB', '256GB']),
    // ── Infinix ───────────────────────────────────────────────────────────────
    ...variants('Infinix', 'Infinix Note 30',       ['128GB', '256GB']),
    ...variants('Infinix', 'Infinix Note 30 Pro',   ['128GB', '256GB']),
    ...variants('Infinix', 'Infinix Note 30 VIP',   ['256GB', '512GB']),
    ...variants('Infinix', 'Infinix Note 40',       ['256GB']),
    ...variants('Infinix', 'Infinix Note 40 Pro',   ['256GB', '512GB']),
    ...variants('Infinix', 'Infinix Note 40 Pro+',  ['256GB', '512GB']),
    ...variants('Infinix', 'Infinix Zero 30',       ['256GB']),
    ...variants('Infinix', 'Infinix Zero 30 5G',    ['256GB']),
    ...variants('Infinix', 'Infinix Zero 40',       ['256GB', '512GB']),
    ...variants('Infinix', 'Infinix Hot 40',        ['128GB', '256GB']),
    ...variants('Infinix', 'Infinix Hot 40i',       ['128GB', '256GB']),
    ...variants('Infinix', 'Infinix Hot 40 Pro',    ['128GB', '256GB']),
    ...variants('Infinix', 'Infinix Smart 8',       ['64GB', '128GB']),
    ...variants('Infinix', 'Infinix Smart 8 Plus',  ['64GB', '128GB']),
    // ── Realme ────────────────────────────────────────────────────────────────
    ...variants('Realme', 'Realme 11',            ['128GB', '256GB']),
    ...variants('Realme', 'Realme 11 Pro',        ['128GB', '256GB']),
    ...variants('Realme', 'Realme 11 Pro+',       ['256GB', '512GB']),
    ...variants('Realme', 'Realme 12',            ['128GB', '256GB']),
    ...variants('Realme', 'Realme 12 Pro',        ['128GB', '256GB']),
    ...variants('Realme', 'Realme 12 Pro+',       ['256GB', '512GB']),
    ...variants('Realme', 'Realme 12x',           ['128GB', '256GB']),
    ...variants('Realme', 'Realme 13',            ['128GB', '256GB']),
    ...variants('Realme', 'Realme 13 Pro',        ['256GB', '512GB']),
    ...variants('Realme', 'Realme 13 Pro+',       ['256GB', '512GB']),
    ...variants('Realme', 'Realme GT 6',          ['256GB', '512GB', '1TB']),
    ...variants('Realme', 'Realme GT 6T',         ['256GB', '512GB']),
    ...variants('Realme', 'Realme GT Neo 6',      ['256GB', '512GB']),
    ...variants('Realme', 'Realme C65',           ['128GB', '256GB']),
    ...variants('Realme', 'Realme C67',           ['128GB', '256GB']),
    ...variants('Realme', 'Realme C75',           ['128GB', '256GB']),
    ...variants('Realme', 'Realme Narzo 70',      ['128GB', '256GB']),
    ...variants('Realme', 'Realme Narzo 70 Pro',  ['128GB', '256GB']),
  ];

  const catalogResult = await (prisma as any).globalProduct.createMany({
    data: catalogData,
    skipDuplicates: true,
  });

  console.log(`✅ ${catalogResult.count} model global kataloğa eklendi (${catalogData.length} toplam, var olanlar atlandı)`);

  // ── DealerStock — Demo Bayi marketplace ürünleri ──────────────────────────
  console.log('\n🛒 Demo bayi stok ürünleri ekleniyor...');

  // İstediğimiz modelleri katalogdan çek
  const gp = await (prisma as any).globalProduct.findMany({
    where: {
      OR: [
        { brand: 'Apple',   model: 'iPhone 15 Pro',     storage: '256GB' },
        { brand: 'Apple',   model: 'iPhone 15 Pro',     storage: '512GB' },
        { brand: 'Apple',   model: 'iPhone 15',         storage: '128GB' },
        { brand: 'Apple',   model: 'iPhone 14 Pro',     storage: '256GB' },
        { brand: 'Apple',   model: 'iPhone 14',         storage: '128GB' },
        { brand: 'Apple',   model: 'iPhone 14',         storage: '256GB' },
        { brand: 'Apple',   model: 'iPhone 13',         storage: '128GB' },
        { brand: 'Apple',   model: 'iPhone 13 Pro Max', storage: '256GB' },
        { brand: 'Apple',   model: 'iPhone 12',         storage: '128GB' },
        { brand: 'Samsung', model: 'Galaxy S24 Ultra',  storage: '256GB' },
        { brand: 'Samsung', model: 'Galaxy S24',        storage: '128GB' },
        { brand: 'Samsung', model: 'Galaxy S23',        storage: '256GB' },
        { brand: 'Samsung', model: 'Galaxy S23 Ultra',  storage: '256GB' },
        { brand: 'Samsung', model: 'Galaxy A55',        storage: '256GB' },
        { brand: 'Xiaomi',  model: 'Xiaomi 14 Ultra',   storage: '512GB' },
        { brand: 'Xiaomi',  model: 'Xiaomi 14',         storage: '256GB' },
        { brand: 'Xiaomi',  model: 'Xiaomi 13T Pro',    storage: '256GB' },
      ],
    },
  }) as any[];

  // GlobalProduct id'lerini brand+model+storage ile indexle
  const gpMap: Record<string, string> = {};
  for (const g of gp) {
    gpMap[`${g.brand}|${g.model}|${g.storage}`] = g.id;
  }

  function gpId(brand: string, model: string, storage: string): string | null {
    return gpMap[`${brand}|${model}|${storage}`] ?? null;
  }

  const dealerStocks = [
    // ── Apple iPhone 15 Pro 256GB — Grade A+ ─────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 15 Pro', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 98, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 10,
      dealerImages: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
      ],
      price: 52900, stock: 2, notes: 'Kutusundan yeni gibi çıkmış, hiç kullanılmamış.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 15 Pro 512GB — Grade A ──────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 15 Pro', '512GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 95, hasBox: true, hasInvoice: false, hasAccessories: true,
      warrantyMonths: 8,
      dealerImages: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 58500, stock: 1, notes: 'Çok az kullanılmış, çizik yok.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 15 128GB — Grade A+ ─────────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 15', '128GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 100, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 11,
      dealerImages: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 42900, stock: 3, notes: 'Sıfır ürün, orijinal paketinde.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 14 Pro 256GB — Grade A ──────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 14 Pro', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 91, hasBox: true, hasInvoice: false, hasAccessories: false,
      warrantyMonths: 4,
      dealerImages: [
        'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 38900, stock: 2, notes: 'Ekran koruyucu takılmış hiç çizilmemiş.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 14 128GB — Grade B ──────────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 14', '128GB'),
      storeId: demoDealerStore.id,
      grade: 'B', batteryHealth: 84, hasBox: false, hasInvoice: false, hasAccessories: false,
      warrantyMonths: 0,
      dealerImages: [
        'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 26500, stock: 1, notes: 'Kasada hafif çizikler var, ekran temiz.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 14 256GB — Grade A ──────────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 14', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 89, hasBox: true, hasInvoice: false, hasAccessories: true,
      warrantyMonths: 2,
      dealerImages: [
        'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 29900, stock: 2, notes: 'Az kullanılmış, temiz cihaz.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 13 128GB — Grade A+ ─────────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 13', '128GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 93, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 0,
      dealerImages: [
        'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 22900, stock: 4, notes: 'Garanti bitmiş ama cihaz mükemmel kondisyonda.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 13 Pro Max 256GB — Grade A ───────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 13 Pro Max', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 88, hasBox: true, hasInvoice: false, hasAccessories: false,
      warrantyMonths: 0,
      dealerImages: [
        'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
      ],
      price: 28900, stock: 1, notes: 'Büyük ekran, pro kamera — harika değer.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Apple iPhone 12 128GB — Grade B ──────────────────────────────────────
    {
      globalProductId: gpId('Apple', 'iPhone 12', '128GB'),
      storeId: demoDealerStore.id,
      grade: 'B', batteryHealth: 80, hasBox: false, hasInvoice: false, hasAccessories: false,
      warrantyMonths: 0,
      dealerImages: [
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
      ],
      price: 17500, stock: 3, notes: 'Bütçe dostu seçenek. Kasada hafif izler mevcut.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Samsung Galaxy S24 Ultra 256GB — Grade A+ ─────────────────────────────
    {
      globalProductId: gpId('Samsung', 'Galaxy S24 Ultra', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 97, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 14,
      dealerImages: [
        'https://images.unsplash.com/photo-1705076117936-b893b7931977?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
      ],
      price: 59900, stock: 2, notes: 'S Pen dahil, mükemmel kondisyon.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Samsung Galaxy S24 128GB — Grade A ───────────────────────────────────
    {
      globalProductId: gpId('Samsung', 'Galaxy S24', '128GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 94, hasBox: true, hasInvoice: false, hasAccessories: true,
      warrantyMonths: 9,
      dealerImages: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
      ],
      price: 34900, stock: 3, notes: 'Galaxy AI özellikli harika bir deneyim.',
      adminApproved: true, approvedAt: new Date(),

    },
    // ──── Samsung Galaxy S23 256GB — Grade A ──────────────────────────────────
    {
      globalProductId: gpId('Samsung', 'Galaxy S23', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 87, hasBox: true, hasInvoice: false, hasAccessories: false,
      warrantyMonths: 3,
      dealerImages: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
      ],
      price: 24900, stock: 2, notes: 'Snapdragon 8 Gen 2 güçlü performans.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ──── Samsung Galaxy S23 Ultra 256GB — Grade A+ ───────────────────────────
    {
      globalProductId: gpId('Samsung', 'Galaxy S23 Ultra', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 96, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 6,
      dealerImages: [
        'https://images.unsplash.com/photo-1705076117936-b893b7931977?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
      ],
      price: 44900, stock: 1, notes: '200MP kamera, çok az kullanılmış.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Samsung Galaxy A55 256GB — Grade A+ ──────────────────────────────────
    {
      globalProductId: gpId('Samsung', 'Galaxy A55', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 100, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 18,
      dealerImages: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
      ],
      price: 19900, stock: 5, notes: 'Sıfır ürün, bütçe segmentinin en iyisi.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Xiaomi 14 Ultra 512GB — Grade A+ ─────────────────────────────────────
    {
      globalProductId: gpId('Xiaomi', 'Xiaomi 14 Ultra', '512GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 99, hasBox: true, hasInvoice: true, hasAccessories: true,
      warrantyMonths: 16,
      dealerImages: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
      ],
      price: 39900, stock: 2, notes: 'Leica optik, fotoğraf tutkunları için ideal.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Xiaomi 14 256GB — Grade A ─────────────────────────────────────────────
    {
      globalProductId: gpId('Xiaomi', 'Xiaomi 14', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A', batteryHealth: 95, hasBox: true, hasInvoice: false, hasAccessories: true,
      warrantyMonths: 7,
      dealerImages: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
      ],
      price: 28900, stock: 3, notes: 'Snapdragon 8 Gen 3, harika deÄŸer.',
      adminApproved: true, approvedAt: new Date(),
    },
    // ── Xiaomi 13T Pro 256GB — Grade A+ ──────────────────────────────────────
    {
      globalProductId: gpId('Xiaomi', 'Xiaomi 13T Pro', '256GB'),
      storeId: demoDealerStore.id,
      grade: 'A+', batteryHealth: 97, hasBox: true, hasInvoice: false, hasAccessories: true,
      warrantyMonths: 5,
      dealerImages: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=900&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&h=900&fit=crop&q=80',
      ],
      price: 21900, stock: 4, notes: '144Hz AMOLED ekran, 50W şarj.',
      adminApproved: true, approvedAt: new Date(),
    },
  ].filter(ds => ds.globalProductId !== null); // GlobalProduct bulunamayanlarÄ± atla

  for (const ds of dealerStocks) {
    await (prisma as any).dealerStock.create({ data: ds });
  }
  console.log(`✅ ${dealerStocks.length} DealerStock ürün eklendi (demo bayi mağazası).`);

  // Marka özeti
  const brandCounts = await (prisma as any).globalProduct.groupBy({
    by: ['brand'],
    _count: { id: true },
    orderBy: { brand: 'asc' },
  });
  console.log('\n📊 Katalog marka özeti:');
  (brandCounts as any[]).forEach((b: any) => {
    console.log(`   ${b.brand.padEnd(12)} — ${b._count.id} varyant`);
  });

  // ── Hero Slides ──────────────────────────────────────────────────────────────
  await (prisma as any).heroSlide?.deleteMany().catch(() => {});

  const heroSlides = [
    {
      order: 0,
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1920&h=800&fit=crop&q=85',
      title: 'Elite Teknoloji',
      subtitle: 'Uzman testinden geçmiş premium yenilenmiş cihazlar — Escrow güvencesiyle.',
      btnLeftText: 'Koleksiyonu Keşfet',
      btnLeftLink: '/',
      btnRightText: 'Bayi Başvurusu',
      btnRightLink: '/register-dealer',
      textColor: '#ffffff',
      textAlignment: 'left',
      overlayOpacity: 50,
      animationType: 'fade',
      buttonStyle: 'solid',
      isActive: true,
    },
    {
      order: 1,
      imageUrl: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=1920&h=800&fit=crop&q=85',
      title: 'iPhone 15 Pro Serisi',
      subtitle: 'Titanium tasarım. A17 Pro çip. Profesyonel kamera sistemi.',
      btnLeftText: 'iPhone\'ları Gör',
      btnLeftLink: '/',
      btnRightText: null,
      btnRightLink: null,
      textColor: '#ffffff',
      textAlignment: 'center',
      overlayOpacity: 40,
      animationType: 'slide',
      buttonStyle: 'outline',
      isActive: true,
    },
    {
      order: 2,
      imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=1920&h=800&fit=crop&q=85',
      title: 'Galaxy S24 Ultra',
      subtitle: 'Galaxy AI ile desteklenen en güçlü Samsung deneyimi.',
      btnLeftText: 'Samsung Keşfet',
      btnLeftLink: '/',
      btnRightText: null,
      btnRightLink: null,
      textColor: '#ffffff',
      textAlignment: 'right',
      overlayOpacity: 45,
      animationType: 'zoom',
      buttonStyle: 'solid',
      isActive: true,
    },
  ];

  for (const slide of heroSlides) {
    await (prisma as any).heroSlide.create({ data: slide });
  }
  console.log(`✅ ${heroSlides.length} hero slide eklendi.`);

  // ── Site Config (singleton) ───────────────────────────────────────────────
  await (prisma as any).siteConfig?.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      settings: {
        categories: [
          { id: 'iphone',  label: 'iPhone',   icon: 'apple',   active: true },
          { id: 'samsung', label: 'Samsung',  icon: 'samsung', active: true },
          { id: 'xiaomi',  label: 'Xiaomi',   icon: 'xiaomi',  active: true },
          { id: 'others',  label: 'DiÄŸerleri', icon: 'phone',  active: true },
        ],
        trustBar: {
          enabled: true,
          items: [
            { icon: 'shield', text: 'Escrow Güvencesi' },
            { icon: 'check',  text: '6 Ay Garanti' },
            { icon: 'lock',   text: '256-Bit SSL' },
            { icon: 'truck',  text: 'HÄ±zlÄ± Kargo' },
          ],
        },
        // Navbar mega menu model görselleri (admin panelinden güncellenebilir)
        navbarModels: {
          'iPhone 15 Pro Max': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=120&h=120&fit=crop&q=80',
          'iPhone 15 Pro':     'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=120&h=120&fit=crop&q=80',
          'iPhone 15 Plus':    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=120&h=120&fit=crop&q=80',
          'iPhone 15':         'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=120&h=120&fit=crop&q=80',
          'iPhone 14 Pro Max': 'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=120&h=120&fit=crop&q=80',
          'iPhone 14 Pro':     'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=120&h=120&fit=crop&q=80',
          'iPhone 14 Plus':    'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=120&h=120&fit=crop&q=80',
          'iPhone 14':         'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=120&h=120&fit=crop&q=80',
          'iPhone 13 Pro Max': 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=120&h=120&fit=crop&q=80',
          'iPhone 13 Pro':     'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=120&h=120&fit=crop&q=80',
          'iPhone 13 mini':    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=120&h=120&fit=crop&q=80',
          'iPhone 13':         'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=120&h=120&fit=crop&q=80',
          'Galaxy S24 Ultra':  'https://images.unsplash.com/photo-1705076117936-b893b7931977?w=120&h=120&fit=crop&q=80',
          'Galaxy S24+':       'https://images.unsplash.com/photo-1705076117936-b893b7931977?w=120&h=120&fit=crop&q=80',
          'Galaxy S24 FE':     'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=120&h=120&fit=crop&q=80',
          'Galaxy S24':        'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=120&h=120&fit=crop&q=80',
          'Galaxy S23 Ultra':  'https://images.unsplash.com/photo-1612442443556-09b5b309e637?w=120&h=120&fit=crop&q=80',
          'Galaxy S23+':       'https://images.unsplash.com/photo-1612442443556-09b5b309e637?w=120&h=120&fit=crop&q=80',
          'Galaxy Z Fold 6':   'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=120&h=120&fit=crop&q=80',
          'Galaxy Z Fold 5':   'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=120&h=120&fit=crop&q=80',
          '14 Pro':            'https://images.unsplash.com/photo-1598327105854-d8d6b866b4e5?w=120&h=120&fit=crop&q=80',
          '13 Ultra':          'https://images.unsplash.com/photo-1598327105854-d8d6b866b4e5?w=120&h=120&fit=crop&q=80',
        },
      },
    },
  }).catch(() => {});
  console.log('✅ SiteConfig upsert edildi.');

  console.log('\n✅ SUPER APP Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

