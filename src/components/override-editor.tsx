'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getOverride, setOverride } from '@/lib/storage';

export function OverrideEditor({
  date,
  defaultTitle,
  defaultDetails,
  onChange,
}: {
  date: string;
  defaultTitle: string;
  defaultDetails: string;
  onChange?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [hasOverride, setHasOverride] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOverride(date).then((o) => {
      if (cancelled) return;
      if (o?.customTitle || o?.customDetails) {
        setTitle(o.customTitle ?? '');
        setDetails(o.customDetails ?? '');
        setHasOverride(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  async function save() {
    const existing = (await getOverride(date)) ?? { date };
    await setOverride(date, {
      ...existing,
      customTitle: title || undefined,
      customDetails: details || undefined,
    });
    setHasOverride(Boolean(title || details));
    setOpen(false);
    onChange?.();
  }

  async function reset() {
    const existing = (await getOverride(date)) ?? { date };
    await setOverride(date, {
      ...existing,
      customTitle: undefined,
      customDetails: undefined,
    });
    setTitle('');
    setDetails('');
    setHasOverride(false);
    setOpen(false);
    onChange?.();
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
          if (!title) setTitle(defaultTitle);
          if (!details) setDetails(defaultDetails);
        }}
      >
        {hasOverride ? 'Edit custom session' : 'Customise this session'}
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-md border border-white/10 p-3">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Session title"
        className="border-slate-800 bg-slate-900"
      />
      <Textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={6}
        placeholder="Session details"
        className="border-slate-800 bg-slate-900"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={save}>
          Save
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        {hasOverride && (
          <Button variant="destructive" size="sm" onClick={reset}>
            Reset to plan default
          </Button>
        )}
      </div>
    </div>
  );
}
