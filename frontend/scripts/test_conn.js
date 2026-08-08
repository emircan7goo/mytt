const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const connectionString = "postgresql://neondb_owner:npg_O53NHhMsuAfx@ep-quiet-dawn-asa5yj91.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require";
process.env.DATABASE_URL = connectionString;

async function test() {
  console.log('Testing connection with process.env.DATABASE_URL =', process.env.DATABASE_URL);
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const users = await prisma.user.findMany();
    console.log('🎉 SUCCESS! Users count:', users.length);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
