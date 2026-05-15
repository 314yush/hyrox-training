// One-shot script: creates the `hyrox_data` key/value table in Neon.
// Run: node --env-file=.env.local scripts/init-db.mjs

import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('✖ DATABASE_URL is not set. Add it to .env.local.');
  process.exit(1);
}

const sql = neon(url);

await sql`
  CREATE TABLE IF NOT EXISTS hyrox_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const rows = await sql`SELECT key, updated_at FROM hyrox_data ORDER BY key`;
console.log('✓ hyrox_data table ready.');
if (rows.length) {
  console.log('  Current rows:');
  for (const r of rows) console.log(`    - ${r.key}  (${r.updated_at})`);
} else {
  console.log('  (table empty)');
}
