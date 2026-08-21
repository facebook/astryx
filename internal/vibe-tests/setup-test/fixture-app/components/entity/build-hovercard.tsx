'use client';

/**
 * Build hovercard — hover a build reference to preview it.
 *
 * Hand-rolled: shows on mouseenter, hides on mouseleave, positioned absolutely
 * under the trigger. No focus path (hover only), no dismiss key, fixed z-index.
 * The pattern here is the one other entity previews have copied.
 */

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {fetchBuild, type Build} from '@/lib/entities';
import {StatusBadge} from '@/components/status-badge';

export function BuildHovercard({
  buildId,
  children,
}: {
  buildId: string;
  children: React.ReactNode;
}) {
  const [build, setBuild] = useState<Build | null>(null);
  const [open, setOpen] = useState(false);

  async function show() {
    setOpen(true);
    if (!build) {
      try {
        setBuild(await fetchBuild(buildId));
      } catch {
        setOpen(false);
      }
    }
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}>
      <span className="cursor-default underline decoration-dotted underline-offset-2">
        {children}
      </span>

      {open ? (
        <span
          className={cn(
            'absolute left-0 top-5 z-50 block w-72 rounded-md border border-border bg-card p-2.5',
            'text-xs shadow-lg',
          )}>
          {build ? (
            <>
              <span className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate font-medium">{build.title}</span>
                <StatusBadge status={build.status} />
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {build.author} · {build.branch}
              </span>
            </>
          ) : (
            <span className="block text-[11px] text-muted-foreground">
              Loading…
            </span>
          )}
        </span>
      ) : null}
    </span>
  );
}
