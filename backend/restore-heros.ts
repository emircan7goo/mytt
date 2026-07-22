import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://root:password123@localhost:5432/telefoncum_db?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Restoring Hero Slides...');
  
  // Clear existing slides first to avoid duplicates
  await prisma.heroSlide.deleteMany();

  await prisma.heroSlide.create({
    data: {
      title: 'Kusursuz Apple Deneyimi.',
      subtitle: 'TSE Onaylı, 12 Ay Garantili ve 21 Nokta Kontrollü elite cihazlarla tanışın.',
      imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=1600&q=100',
      btnLeftText: 'Galeriyi Keşfet',
      btnLeftLink: '/?cat=Apple',
      btnRightText: 'Takas Desteği',
      btnRightLink: '/yardim',
      isActive: true,
      order: 0
    }
  });

  await prisma.heroSlide.create({
    data: {
      title: 'Galaxy S23 Serisi.',
      subtitle: 'Premium yenilenmiş Android ekosistemine giriş yapın.',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1600&q=80',
      btnLeftText: 'Samsung Modelleri',
      btnLeftLink: '/?cat=Samsung',
      isActive: true,
      order: 1
    }
  });

  console.log('Hero Slides restored successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
