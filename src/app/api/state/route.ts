import { NextResponse } from 'next/server';
import { db, hasDatabase } from '@/lib/db';

const ALLOWED_KEYS = new Set(['overrides', 'baselines', 'paceOverrides']);

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: 'database_not_configured' },
      { status: 503 },
    );
  }
  const sql = db();
  const rows = (await sql`SELECT key, value FROM hyrox_data`) as Array<{
    key: string;
    value: unknown;
  }>;
  const out: Record<string, unknown> = {};
  for (const row of rows) {
    if (ALLOWED_KEYS.has(row.key)) out[row.key] = row.value;
  }
  return NextResponse.json(out);
}

export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: 'database_not_configured' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const { key, value } = body as { key?: string; value?: unknown };

  if (typeof key !== 'string' || !ALLOWED_KEYS.has(key)) {
    return NextResponse.json({ error: 'invalid_key' }, { status: 400 });
  }
  if (value === undefined) {
    return NextResponse.json({ error: 'missing_value' }, { status: 400 });
  }

  const sql = db();
  await sql`
    INSERT INTO hyrox_data (key, value, updated_at)
    VALUES (${key}, ${JSON.stringify(value)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
  `;
  return NextResponse.json({ ok: true });
}
