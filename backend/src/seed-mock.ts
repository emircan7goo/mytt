import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:password123@localhost:5432/telefoncum_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old structured data...');
  await prisma.heroSlide.deleteMany();
  await prisma.dealerStock.deleteMany();
  await prisma.globalProduct.deleteMany();
  await prisma.stockRequest.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const mockPassword = await bcrypt.hash('123456', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mytt.com',
      name: 'Super Admin',
      role: 'ADMIN',
      b2bStatus: 'APPROVED',
      password: mockPassword
    }
  });

  // Create Dealer
  const dealer = await prisma.user.create({
    data: {
      email: 'dealer@mytt.com',
      name: 'EasyCep Elite',
      role: 'DEALER',
      b2bStatus: 'APPROVED',
      password: mockPassword
    }
  });

  // Create Store for Dealer
  const store = await prisma.store.create({
    data: {
      ownerId: dealer.id,
      name: 'EasyCep Premium Outlet',
      isPremium: true
    }
  });

  // Create Dealer 2
  const dealer2 = await prisma.user.create({
    data: {
      email: 'dealer2@mytt.com',
      name: 'Bilişim Telekom',
      role: 'DEALER',
      b2bStatus: 'APPROVED',
      password: mockPassword
    }
  });

  const store2 = await prisma.store.create({
    data: {
      ownerId: dealer2.id,
      name: 'Bilişim Telekom',
      isPremium: false
    }
  });

  console.log('Seeding Hero Slides...');
  await prisma.heroSlide.create({
    data: {
      title: 'Kusursuz Apple Deneyimi.',
      subtitle: 'TSE Onaylı, 12 Ay Garantili ve 21 Nokta Kontrollü elite cihazlarla tanışın.',
      imageUrl: '/banners/hero-apple.png', // or 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1600&q=100'
      btnLeftText: 'Galeriyi Keşfet',
      btnLeftLink: '/?cat=Apple',
      btnRightText: 'Takas Desteği',
      btnRightLink: '/yardim'
    }
  });

  await prisma.heroSlide.create({
    data: {
      title: 'Galaxy S23 Serisi.',
      subtitle: 'Premium yenilenmiş Android ekosistemine giriş yapın.',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1600&q=80',
      btnLeftText: 'Samsung Modelleri',
      btnLeftLink: '/?cat=Samsung',
      order: 1
    }
  });

  console.log('Seeding Global Products...');
  const g1 = await prisma.globalProduct.create({
    data: {
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      storage: '256GB',
      color: 'Uzay Siyahı',
      masterImages: ['https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-model-unselect-gallery-2-202209_GEO_EMEA?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660753617559'],
      isActive: true,
      specsJson: { cosmeticGrade: 'A', screen: '6.7 inç' }
    }
  });

  const g2 = await prisma.globalProduct.create({
    data: {
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128GB',
      color: 'Gece Yarısı',
      masterImages: ['https://www.apple.com/v/iphone/home/bu/images/overview/select/iphone_14__cjgvgyn9cquu_large.png'],
      isActive: true,
      specsJson: { cosmeticGrade: 'B', screen: '6.1 inç' }
    }
  });

  const g3 = await prisma.globalProduct.create({
    data: {
      brand: 'Samsung',
      model: 'Galaxy S23 Ultra',
      storage: '512GB',
      color: 'Yeşil',
      masterImages: ['https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s928-sm-s928bztqtur-539478144?$650_519_PNG$'],
      isActive: true,
      specsJson: { cosmeticGrade: 'A+', screen: '6.8 inç' }
    }
  });

  console.log('Seeding Dealer Stocks...');
  await prisma.dealerStock.create({
    data: {
      globalProductId: g1.id,
      storeId: store.id,
      grade: 'A+',
      batteryHealth: 95,
      hasBox: true,
      hasInvoice: true,
      price: 36500.00,
      stock: 5,
      warrantyMonths: 12
    }
  });

  await prisma.dealerStock.create({
    data: {
      globalProductId: g1.id,
      storeId: store2.id,
      grade: 'A',
      batteryHealth: 88,
      hasBox: false,
      price: 35000.00,
      stock: 2,
      warrantyMonths: 6
    }
  }); // Dealer2 is cheaper

  await prisma.dealerStock.create({
    data: {
      globalProductId: g2.id,
      storeId: store.id,
      grade: 'B',
      batteryHealth: 82,
      hasBox: false,
      price: 19500.00,
      stock: 12,
      warrantyMonths: 3
    }
  });

  await prisma.dealerStock.create({
    data: {
      globalProductId: g3.id,
      storeId: store2.id,
      grade: 'A',
      batteryHealth: 100,
      hasBox: true,
      price: 41000.00,
      stock: 3,
      warrantyMonths: 24
    }
  });

  console.log('Seeding complete. Use these emails to login (password any 6 chars if mock login is enabled): admin@mytt.com, dealer@mytt.com');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
