'use client';

import {useEffect, useState} from 'react';
import {cn} from '@/lib/utils';
import {fetchRuns, type Run} from '@/lib/entities';
import {StatusBadge} from '@/components/status-badge';
import {BuildHovercard} from '@/components/entity/build-hovercard';

function duration(ms: number) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

export function RunTable({env}: {env: string}) {
  const [runs, setRuns] = useState<Run[]>([]);

  useEffect(() => {
    let live = true;
    fetchRuns(env)
      .then(r => live && setRuns(r))
      .catch(() => live && setRuns([]));
    return () => {
      live = false;
    };
  }, [env]);

  return (
    <table className="w-full border-separate border-spacing-0 text-xs">
      <thead>
        <tr className="text-left text-muted-foreground">
          {['Run', 'Service', 'Status', 'Build', 'Started', 'Duration'].map(
            h => (
              <th
                key={h}
                className="border-b border-border px-2 py-1.5 font-medium">
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {runs.map(run => (
          <tr key={run.id} className={cn('hover:bg-accent/40')}>
            <td className="border-b border-border px-2 py-1.5 font-mono">
              {run.id}
            </td>
            <td className="border-b border-border px-2 py-1.5">
              {run.service}
            </td>
            <td className="border-b border-border px-2 py-1.5">
              <StatusBadge status={run.status} />
            </td>
            <td className="border-b border-border px-2 py-1.5">
              <BuildHovercard buildId={run.buildId}>
                <span className="font-mono">{run.buildId}</span>
              </BuildHovercard>
            </td>
            <td className="border-b border-border px-2 py-1.5 text-muted-foreground">
              {run.startedAt}
            </td>
            <td className="border-b border-border px-2 py-1.5 text-muted-foreground">
              {duration(run.durationMs)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
