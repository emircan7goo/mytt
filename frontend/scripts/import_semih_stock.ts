// Üretim DB'sine bağlanarak kullanıcı ve tablo yapısını listele
// DATABASE_URL'yi farklı kombinasyonlarla dene

const URLS_TO_TRY = [
  "postgresql://neondb_owner:npg_O53NHhMsuAfx@ep-quiet-dawn-asa5yj91-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
];

import { neonConfig, neon } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function tryUrl(url: string) {
  const sql = neon(url);
  try {
    const tables = await sql`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_type = 'BASE TABLE' 
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `;
    return tables;
  } catch (e: any) {
    return { error: e.message };
  }
}

async function main() {
  for (const url of URLS_TO_TRY) {
    const host = new URL(url).hostname;
    console.log(`\nTrying: ${host}`);
    const result = await tryUrl(url);
    if (Array.isArray(result)) {
      console.log('✅ Bağlandı! Tablolar:');
      result.forEach((t: any) => console.log(`  ${t.table_schema}.${t.table_name}`));
    } else {
      console.log('❌ Hata:', result.error?.slice(0, 100));
    }
  }
}

main();
