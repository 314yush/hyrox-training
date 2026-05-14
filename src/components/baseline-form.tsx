'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getBaselines, setBaselines } from '@/lib/storage';
import type { Baselines } from '@/lib/types';

export function BaselineForm({
  onChange,
}: {
  onChange?: (b: Baselines) => void;
}) {
  const [b, setB] = useState<Baselines>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getBaselines().then((x) => {
      if (cancelled) return;
      setB(x);
      setLoaded(true);
      onChange?.(x);
    });
    return () => {
      cancelled = true;
    };
  }, [onChange]);

  function update<K extends keyof Baselines>(key: K, value: Baselines[K]) {
    setB((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await setBaselines(b);
    const updated = await getBaselines();
    setB(updated);
    setSaving(false);
    onChange?.(updated);
  }

  if (!loaded) {
    return <div className="text-xs text-slate-500">Loading…</div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="1 km time"
          placeholder="4:15"
          value={b.km1Time ?? ''}
          onChange={(v) => update('km1Time', v || undefined)}
        />
        <Field
          label="5 km time"
          placeholder="22:30"
          value={b.km5Time ?? ''}
          onChange={(v) => update('km5Time', v || undefined)}
        />
        <Field
          label="Wall ball max"
          placeholder="20"
          value={String(b.wallBallMaxUnbroken ?? '')}
          onChange={(v) =>
            update('wallBallMaxUnbroken', v ? Number(v) : undefined)
          }
        />
        <Field
          label="500 m row"
          placeholder="1:45"
          value={b.row500mTime ?? ''}
          onChange={(v) => update('row500mTime', v || undefined)}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Burpee broad jump notes
        </Label>
        <Textarea
          value={b.burpeeBroadJumpNotes ?? ''}
          onChange={(e) =>
            update('burpeeBroadJumpNotes', e.target.value || undefined)
          }
          rows={2}
          className="border-slate-800 bg-slate-900"
          placeholder="How did the movement feel?"
        />
      </div>
      <Button onClick={save} disabled={saving} size="sm">
        {saving ? 'Saving…' : 'Save baselines'}
      </Button>
      {b.updatedAt && (
        <div className="text-[10px] text-slate-500">
          Last updated {new Date(b.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-slate-800 bg-slate-900"
      />
    </div>
  );
}
