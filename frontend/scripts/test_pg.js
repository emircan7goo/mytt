const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = "postgresql://neondb_owner:npg_O53NHhMsuAfx@ep-quiet-dawn-asa5yj91.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await prisma.user.count();
    console.log('🎉 SUCCESS WITH PRISMA-PG ADAPTER! User count:', count);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
