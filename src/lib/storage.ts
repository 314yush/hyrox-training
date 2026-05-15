'use client';

import { get, set, del } from 'idb-keyval';
import type { Override, Baselines, PaceTargets } from './types';

const KEY_OVERRIDES = 'hyrox.overrides';
const KEY_BASELINES = 'hyrox.baselines';
const KEY_PACES = 'hyrox.paces';

const REMOTE_KEYS = {
  overrides: 'overrides',
  baselines: 'baselines',
  paceOverrides: 'paceOverrides',
} as const;

type OverrideMap = Record<string, Override>;

// ---------- IDB primitives ----------
async function idbGet<T>(key: string): Promise<T | undefined> {
  return get<T>(key);
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  await set(key, value);
}

// ---------- Remote sync ----------
type RemoteKey = keyof typeof REMOTE_KEYS;

const REMOTE_KEY_TO_IDB: Record<RemoteKey, string> = {
  overrides: KEY_OVERRIDES,
  baselines: KEY_BASELINES,
  paceOverrides: KEY_PACES,
};

export type HydrateResult = 'synced' | 'no-db' | 'offline';

let hydrated = false;
let hydratePromise: Promise<HydrateResult> | null = null;
const pendingTimers: Partial<Record<RemoteKey, ReturnType<typeof setTimeout>>> = {};

async function pushRemote<K extends RemoteKey>(
  key: K,
  value: unknown,
): Promise<void> {
  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: REMOTE_KEYS[key], value }),
    });
    if (!res.ok && res.status !== 503) {
      console.warn(`[storage] push ${key} failed: ${res.status}`);
    }
  } catch (e) {
    console.warn(`[storage] push ${key} network error`, e);
  }
}

function schedulePush<K extends RemoteKey>(key: K, value: unknown) {
  if (typeof window === 'undefined') return;
  if (pendingTimers[key]) clearTimeout(pendingTimers[key]);
  pendingTimers[key] = setTimeout(() => {
    pendingTimers[key] = undefined;
    void pushRemote(key, value);
  }, 800);
}

export async function hydrateFromRemote(): Promise<HydrateResult> {
  if (typeof window === 'undefined') return 'offline';
  if (hydrated) return 'synced';
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async (): Promise<HydrateResult> => {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (res.status === 503) return 'no-db';
      if (!res.ok) return 'offline';
      const remote = (await res.json()) as Partial<
        Record<RemoteKey, unknown>
      >;
      for (const k of Object.keys(REMOTE_KEYS) as RemoteKey[]) {
        if (remote[k] !== undefined) {
          await idbSet(REMOTE_KEY_TO_IDB[k], remote[k]);
        }
      }
      hydrated = true;
      window.dispatchEvent(new CustomEvent('hyrox:hydrated'));
      return 'synced';
    } catch {
      return 'offline';
    }
  })();

  return hydratePromise;
}

// ---------- Overrides ----------
export async function getOverrides(): Promise<OverrideMap> {
  return (await idbGet<OverrideMap>(KEY_OVERRIDES)) ?? {};
}

export async function setOverride(date: string, override: Override): Promise<void> {
  const all = await getOverrides();
  if (!override.customTitle && !override.customDetails && !override.note) {
    delete all[date];
  } else {
    all[date] = { ...override, date };
  }
  await idbSet(KEY_OVERRIDES, all);
  schedulePush('overrides', all);
}

export async function getOverride(date: string): Promise<Override | null> {
  const all = await getOverrides();
  return all[date] ?? null;
}

// ---------- Baselines ----------
export async function getBaselines(): Promise<Baselines> {
  return (await idbGet<Baselines>(KEY_BASELINES)) ?? {};
}

export async function setBaselines(b: Baselines): Promise<void> {
  const next = { ...b, updatedAt: new Date().toISOString() };
  await idbSet(KEY_BASELINES, next);
  schedulePush('baselines', next);
}

// ---------- Pace overrides ----------
export async function getPaceOverrides(): Promise<PaceTargets> {
  return (await idbGet<PaceTargets>(KEY_PACES)) ?? {};
}

export async function setPaceOverrides(p: PaceTargets): Promise<void> {
  await idbSet(KEY_PACES, p);
  schedulePush('paceOverrides', p);
}

// ---------- Util ----------
export async function clearAll(): Promise<void> {
  await del(KEY_OVERRIDES);
  await del(KEY_BASELINES);
  await del(KEY_PACES);
}
