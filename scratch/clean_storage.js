const path = require('path');
const frontendDir = path.join(__dirname, '..', 'frontend');
const { Pool } = require(path.join(frontendDir, 'node_modules', '@neondatabase', 'serverless'));

const connectionString = "postgresql://neondb_owner:npg_G4nB9SslZkxF@ep-snowy-breeze-a2l2yq04.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });

async function fixStorage() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, brand, model, storage FROM "GlobalProduct"');
    console.log(`Checking ${res.rows.length} global products...`);
    let fixedCount = 0;
    for (const p of res.rows) {
      if (p.storage) {
        let clean = p.storage
          .replace(/gbgb/gi, 'GB')
          .replace(/gb/gi, 'GB')
          .replace(/\s+GB/gi, 'GB')
          .trim();
        clean = clean.replace(/GBGB+/gi, 'GB');

        if (clean !== p.storage) {
          console.log(`Fixing: "${p.storage}" -> "${clean}" for ${p.brand} ${p.model}`);
          await client.query('UPDATE "GlobalProduct" SET storage = $1 WHERE id = $2', [clean, p.id]);
          fixedCount++;
        }
      }
    }
    console.log(`Database storage cleanup completed! Fixed ${fixedCount} items.`);
  } finally {
    client.release();
  }
}

fixStorage().catch(console.error).finally(() => pool.end());
