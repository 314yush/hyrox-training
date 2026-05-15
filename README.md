# HYROX Tracker

Day-by-day training plan for **HYROX Mumbai — 20 Sep 2026 — sub 1:15**.
Mobile-first PWA. Local-first storage with optional Neon Postgres sync.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Optional: Neon Postgres sync

Without a database, the app works offline-only — your notes, baselines, and
overrides stay in your browser's IndexedDB. Add a Neon connection to sync
across devices.

### 1. Create a Neon project
1. Sign up at https://console.neon.tech (free tier is plenty)
2. Create a project
3. Copy the connection string from **Connection Details**

### 2. Configure env
```bash
cp .env.local.example .env.local
# paste your DATABASE_URL into .env.local
```

### 3. Initialise the table
```bash
node --env-file=.env.local scripts/init-db.mjs
```

### 4. Restart the dev server
```bash
npm run dev
```

A small "◆ synced" indicator appears top-left on first load when the API is
reachable. Without a DB, the app stays IDB-only (silent fallback).

## Scripts

- `npm run dev` — Next.js dev server (Turbopack)
- `npm run build` — production build
- `npm test` — vitest unit tests
- `node --env-file=.env.local scripts/init-db.mjs` — create the `hyrox_data` table

## Stack

- Next.js 16 App Router
- Tailwind CSS v4 + shadcn/ui primitives
- IndexedDB via `idb-keyval` (instant local reads, offline support)
- Neon Postgres (optional) via `@neondatabase/serverless`
- Big Shoulders Display + JetBrains Mono + Manrope (Google Fonts)
