import { PrismaClient } from '@prisma/client';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

async function fixStorage() {
  const products = await prisma.globalProduct.findMany();
  console.log(`Found ${products.length} products`);
  for (const p of products) {
    if (p.storage && /gb/i.test(p.storage)) {
      // Fix double gbGB or weird casing like 64 gbGB -> 64GB
      let cleanStorage = p.storage
        .replace(/gbgb/gi, 'GB')
        .replace(/gb/gi, 'GB')
        .replace(/\s+GB/g, 'GB')
        .trim();
      
      // If result is like 64GBGB -> 64GB
      cleanStorage = cleanStorage.replace(/GBGB+/gi, 'GB');

      if (cleanStorage !== p.storage) {
        console.log(`Fixing storage for ${p.brand} ${p.model}: "${p.storage}" -> "${cleanStorage}"`);
        await prisma.globalProduct.update({
          where: { id: p.id },
          data: { storage: cleanStorage },
        });
      }
    }
  }
}

fixStorage().catch(console.error).finally(() => prisma.$disconnect());
