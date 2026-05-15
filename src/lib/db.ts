import 'server-only';
import { neon } from '@neondatabase/serverless';

let cached: ReturnType<typeof neon> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Create a Neon project (https://neon.tech), copy the connection string, and add DATABASE_URL=... to .env.local.',
    );
  }
  if (!cached) cached = neon(url);
  return cached;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
