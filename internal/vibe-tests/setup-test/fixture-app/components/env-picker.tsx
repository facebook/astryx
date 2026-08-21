'use client';

/**
 * Environment picker.
 *
 * Hand-rolled menu: the shared primitives didn't cover a trigger that shows the
 * current value plus a description per row, so this builds it from a button and
 * an absolutely positioned list. Mouse-first — the keyboard path was never
 * finished (see the TODO).
 */

import {useState} from 'react';
import {ChevronDown} from 'lucide-react';
import {cn} from '@/lib/utils';
import {ENVIRONMENTS} from '@/lib/entities';

export function EnvPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = ENVIRONMENTS.find(e => e.id === value) ?? ENVIRONMENTS[0];

  // TODO: arrow keys / Home / End / Escape. Tab reaches the trigger only; the
  // rows are divs, so there is nothing to focus once the menu is open.
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs',
          'hover:bg-accent focus:outline-none',
        )}>
        <span className="font-medium">{current.label}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </button>

      {open ? (
        <div
          className="absolute left-0 top-9 z-50 w-56 rounded-md border border-border bg-card p-1 shadow-lg"
          onMouseLeave={() => setOpen(false)}>
          {ENVIRONMENTS.map(env => (
            <div
              key={env.id}
              onClick={() => {
                onChange(env.id);
                setOpen(false);
              }}
              className={cn(
                'cursor-pointer rounded-md px-2 py-1.5 hover:bg-accent',
                env.id === value && 'bg-accent',
              )}>
              <div className="text-xs font-medium">{env.label}</div>
              <div className="text-[11px] text-muted-foreground">
                {env.description}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
