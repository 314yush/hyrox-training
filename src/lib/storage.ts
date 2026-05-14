'use client';

import { get, set, del } from 'idb-keyval';
import type { Override, Baselines, PaceTargets } from './types';

const KEY_OVERRIDES = 'hyrox.overrides';
const KEY_BASELINES = 'hyrox.baselines';
const KEY_PACES = 'hyrox.paces';

type OverrideMap = Record<string, Override>;

export async function getOverrides(): Promise<OverrideMap> {
  return (await get<OverrideMap>(KEY_OVERRIDES)) ?? {};
}

export async function setOverride(date: string, override: Override): Promise<void> {
  const all = await getOverrides();
  if (!override.customTitle && !override.customDetails && !override.note) {
    delete all[date];
  } else {
    all[date] = { ...override, date };
  }
  await set(KEY_OVERRIDES, all);
}

export async function getOverride(date: string): Promise<Override | null> {
  const all = await getOverrides();
  return all[date] ?? null;
}

export async function getBaselines(): Promise<Baselines> {
  return (await get<Baselines>(KEY_BASELINES)) ?? {};
}

export async function setBaselines(b: Baselines): Promise<void> {
  await set(KEY_BASELINES, { ...b, updatedAt: new Date().toISOString() });
}

export async function getPaceOverrides(): Promise<PaceTargets> {
  return (await get<PaceTargets>(KEY_PACES)) ?? {};
}

export async function setPaceOverrides(p: PaceTargets): Promise<void> {
  await set(KEY_PACES, p);
}

export async function clearAll(): Promise<void> {
  await del(KEY_OVERRIDES);
  await del(KEY_BASELINES);
  await del(KEY_PACES);
}
